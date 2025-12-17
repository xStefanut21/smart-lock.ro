import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://smart-lock.ro").replace(
      /\/$/,
      ""
    );
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    const resendApiKey = process.env.RESEND_API_KEY;
    const adminEmail = process.env.ADMIN_EMAIL;
    const emailFrom = process.env.EMAIL_FROM;
    const replyTo = process.env.REPLY_TO;

    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
      console.error("[order-notification] Missing Supabase env vars", {
        hasUrl: !!supabaseUrl,
        hasAnon: !!supabaseAnonKey,
        hasServiceRole: !!supabaseServiceRoleKey,
      });
      return NextResponse.json(
        { error: "Missing Supabase environment variables." },
        { status: 500 }
      );
    }

    if (!resendApiKey || !adminEmail || !emailFrom) {
      console.error("[order-notification] Missing email env vars", {
        hasResend: !!resendApiKey,
        hasAdminEmail: !!adminEmail,
        hasEmailFrom: !!emailFrom,
      });
      return NextResponse.json(
        { error: "Missing email environment variables." },
        { status: 500 }
      );
    }

    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.toLowerCase().startsWith("bearer ")
      ? authHeader.slice(7).trim()
      : "";

    if (!token) {
      console.warn("[order-notification] Missing bearer token");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orderId } = (await req.json().catch(() => ({}))) as {
      orderId?: string;
    };

    if (!orderId) {
      console.warn("[order-notification] Missing orderId");
      return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
    }

    const adminSupabase = createClient(supabaseUrl, supabaseServiceRoleKey);
    const authSupabase = createClient(supabaseUrl, supabaseAnonKey);

    const {
      data: { user },
      error: userError,
    } = await authSupabase.auth.getUser(token);

    if (userError || !user) {
      console.warn("[order-notification] Invalid token", { userError: userError?.message });
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: order, error: orderError } = await adminSupabase
      .from("orders")
      .select(
        "id, created_at, total_amount, shipping_cost, shipping_method, payment_provider, status, shipping_address, billing_address, comment, account_type, company_name, company_cui, company_reg_com, user_id"
      )
      .eq("id", orderId)
      .maybeSingle<any>();

    if (orderError || !order) {
      console.warn("[order-notification] Order not found", {
        orderId,
        orderError: orderError?.message,
      });
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.user_id !== user.id) {
      console.warn("[order-notification] Forbidden", { orderId, userId: user.id });
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { data: items } = await adminSupabase
      .from("order_items")
      .select("quantity, unit_price, color, products(name, slug, image_url)")
      .eq("order_id", orderId);

    const formatMoney = (value: number) =>
      new Intl.NumberFormat("ro-RO", {
        style: "currency",
        currency: "RON",
      }).format(value);

    const mappedLines = (items || []).map((row: any) => {
      const name = row.products?.name ?? "Produs";
      const color = row.color ? ` (${row.color})` : "";
      const slug = row.products?.slug ?? null;
      const imageUrl = row.products?.image_url ?? null;
      const qty = typeof row.quantity === "number" ? row.quantity : 0;
      const unit = typeof row.unit_price === "number" ? row.unit_price : 0;
      const lineTotal = qty * unit;

      const productUrl = slug
        ? `${baseUrl}/products/${encodeURIComponent(slug)}`
        : null;

      const absoluteImageUrl =
        typeof imageUrl === "string" && imageUrl.trim()
          ? imageUrl.startsWith("http")
            ? imageUrl
            : `${baseUrl}${imageUrl.startsWith("/") ? "" : "/"}${imageUrl}`
          : null;

      return {
        name: `${name}${color}`,
        productUrl,
        imageUrl: absoluteImageUrl,
        qty,
        unit,
        total: lineTotal,
      };
    });

    const lines = mappedLines.map((l) => {
      const suffix = l.productUrl ? ` (${l.productUrl})` : "";
      return `- ${l.name} x${l.qty} = ${formatMoney(l.total)}${suffix}`;
    });

    const createdAt = order.created_at
      ? new Date(order.created_at).toLocaleString("ro-RO")
      : "";

    const billing = order.billing_address || {};
    const shipping = order.shipping_address || {};

    const companyBlock =
      order.account_type === "pj" && (order.company_name || order.company_cui || order.company_reg_com)
        ? `\n\nFirmă: ${order.company_name || ""}\nCUI: ${order.company_cui || ""}\nNr. Reg. Com.: ${order.company_reg_com || ""}`
        : "";

    const text = [
      `Comandă nouă: ${order.id}`,
      createdAt ? `Data: ${createdAt}` : "",
      `Total: ${formatMoney(order.total_amount)}`,
      `Transport: ${formatMoney(order.shipping_cost || 0)}`,
      `Metodă livrare: ${order.shipping_method || ""}`,
      `Plată: ${order.payment_provider || ""}`,
      order.comment ? `Comentariu: ${order.comment}` : "",
      "",
      "Produse:",
      ...lines,
      "",
      `Facturare: ${billing?.name || ""} | ${billing?.phone || ""} | ${billing?.line1 || ""}, ${billing?.city || ""} ${billing?.county || ""} ${billing?.postal_code || ""}`,
      `Livrare: ${shipping?.name || ""} | ${shipping?.phone || ""} | ${shipping?.line1 || ""}, ${shipping?.city || ""} ${shipping?.county || ""} ${shipping?.postal_code || ""}`,
      companyBlock,
    ]
      .filter(Boolean)
      .join("\n");

    const subject = `Comandă nouă ${order.id} – Smart-Lock.ro`;

    const customerEmail = user.email || "";
    const customerSubject = `Confirmare comandă ${order.id} – Smart Lock`;

    const adminOrderUrl = `${baseUrl}/admin/orders/${encodeURIComponent(order.id)}`;
    const orderConfirmationUrl = `${baseUrl}/order-confirmation/${encodeURIComponent(order.id)}`;
    const logoUrl = `${baseUrl}/logo2.png`;

    const esc = (s: any) =>
      String(s ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;")
        .replace(/'/g, "&#039;");

    const billingLine = `${billing?.line1 || ""}, ${billing?.city || ""} ${billing?.county || ""} ${billing?.postal_code || ""}`.trim();
    const shippingLine = `${shipping?.line1 || ""}, ${shipping?.city || ""} ${shipping?.county || ""} ${shipping?.postal_code || ""}`.trim();

    const itemsRowsHtml = mappedLines
      .map(
        (l) => `
          <tr>
            <td style="padding:10px 12px;border-top:1px solid #eef2f7;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                <tr>
                  <td style="vertical-align:middle;padding-right:10px;">
                    ${
                      l.imageUrl && l.productUrl
                        ? `<a href="${esc(l.productUrl)}" style="text-decoration:none;display:inline-block;">
                             <img src="${esc(l.imageUrl)}" alt="${esc(l.name)}" width="44" height="44" style="display:block;width:44px;height:44px;object-fit:contain;border-radius:8px;border:1px solid #eef2f7;background:#ffffff;" />
                           </a>`
                        : l.imageUrl
                          ? `<img src="${esc(l.imageUrl)}" alt="${esc(l.name)}" width="44" height="44" style="display:block;width:44px;height:44px;object-fit:contain;border-radius:8px;border:1px solid #eef2f7;background:#ffffff;" />`
                          : ""
                    }
                  </td>
                  <td style="vertical-align:middle;">
                    ${
                      l.productUrl
                        ? `<a href="${esc(l.productUrl)}" style="color:#0f172a;text-decoration:none;font-weight:600;">${esc(
                            l.name
                          )}</a>`
                        : `<span style="color:#0f172a;font-weight:600;">${esc(
                            l.name
                          )}</span>`
                    }
                  </td>
                </tr>
              </table>
            </td>
            <td style="padding:10px 12px;border-top:1px solid #eef2f7;text-align:center;">${esc(
              l.qty
            )}</td>
            <td style="padding:10px 12px;border-top:1px solid #eef2f7;text-align:right;white-space:nowrap;">${esc(
              formatMoney(l.unit)
            )}</td>
            <td style="padding:10px 12px;border-top:1px solid #eef2f7;text-align:right;white-space:nowrap;font-weight:600;">${esc(
              formatMoney(l.total)
            )}</td>
          </tr>`
      )
      .join("");

    const companyHtml =
      order.account_type === "pj" &&
      (order.company_name || order.company_cui || order.company_reg_com)
        ? `
          <div style="margin-top:12px;padding:12px;border:1px solid #eef2f7;border-radius:12px;background:#f8fafc;">
            <div style="font-weight:700;margin-bottom:6px;">Date firmă</div>
            <div style="color:#0f172a;">${esc(order.company_name || "")}</div>
            <div style="color:#475569;">CUI: ${esc(order.company_cui || "")}</div>
            <div style="color:#475569;">Nr. Reg. Com.: ${esc(order.company_reg_com || "")}</div>
          </div>`
        : "";

    const html = `
      <!doctype html>
      <html style="background:#0b0f19;">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width,initial-scale=1" />
          <meta name="color-scheme" content="light" />
          <meta name="supported-color-schemes" content="light" />
          <title>${esc(subject)}</title>
        </head>
        <body bgcolor="#0b0f19" style="margin:0;padding:0;background:#0b0f19;background-color:#0b0f19 !important;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor="#0b0f19" style="background:#0b0f19;">
            <tr>
              <td align="center" bgcolor="#0b0f19" style="padding:24px 12px;background:#0b0f19;background-color:#0b0f19 !important;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="680" style="max-width:680px;width:100%;">
                  <tr>
                    <td style="background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid rgba(17,24,39,0.10);">
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                        <tr>
                          <td bgcolor="#0b0f19" style="background:#0b0f19;padding:18px 20px;">
                            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                              <tr>
                                <td align="left" valign="middle">
                                  <img src="${logoUrl}" alt="Smart Lock" width="170" style="display:block;max-width:170px;height:auto;" />
                                </td>
                                <td align="right" valign="middle" style="text-align:right;">
                                  <div style="color:#e2e8f0;font-size:12px;letter-spacing:.08em;text-transform:uppercase;">Comandă nouă</div>
                                  <div style="color:#ffffff;font-size:14px;font-weight:700;">${esc(order.id)}</div>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding:20px;">
              <div style="display:flex;flex-wrap:wrap;gap:12px;">
                <div style="flex:1;min-width:220px;padding:14px;border:1px solid #eef2f7;border-radius:12px;background:#f8fafc;">
                  <div style="color:#64748b;font-size:12px;">Total</div>
                  <div style="font-size:22px;font-weight:800;color:#0f172a;">${esc(
                    formatMoney(order.total_amount)
                  )}</div>
                  <div style="color:#475569;font-size:12px;margin-top:6px;">
                    Transport: ${esc(formatMoney(order.shipping_cost || 0))}
                  </div>
                </div>
                <div style="flex:1;min-width:220px;padding:14px;border:1px solid #eef2f7;border-radius:12px;">
                  <div style="color:#64748b;font-size:12px;">Metodă livrare</div>
                  <div style="font-size:14px;font-weight:700;color:#0f172a;">${esc(
                    order.shipping_method || ""
                  )}</div>
                  <div style="color:#64748b;font-size:12px;margin-top:10px;">Plată</div>
                  <div style="font-size:14px;font-weight:700;color:#0f172a;">${esc(
                    order.payment_provider || ""
                  )}</div>
                </div>
              </div>

              <div style="margin-top:16px;">
                <div style="font-size:14px;font-weight:800;color:#0f172a;margin-bottom:8px;">Produse</div>
                <div style="border:1px solid #eef2f7;border-radius:12px;overflow:hidden;">
                  <table style="border-collapse:collapse;width:100%;font-size:13px;color:#0f172a;">
                    <thead>
                      <tr style="background:#f1f5f9;">
                        <th style="padding:10px 12px;text-align:left;">Produs</th>
                        <th style="padding:10px 12px;text-align:center;white-space:nowrap;">Cant.</th>
                        <th style="padding:10px 12px;text-align:right;white-space:nowrap;">Preț</th>
                        <th style="padding:10px 12px;text-align:right;white-space:nowrap;">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${itemsRowsHtml}
                    </tbody>
                  </table>
                </div>
              </div>

              <div style="margin-top:16px;display:flex;flex-wrap:wrap;gap:12px;">
                <div style="flex:1;min-width:260px;padding:14px;border:1px solid #eef2f7;border-radius:12px;">
                  <div style="font-weight:800;color:#0f172a;margin-bottom:6px;">Facturare</div>
                  <div style="color:#0f172a;">${esc(billing?.name || "")}</div>
                  <div style="color:#475569;">${esc(billing?.phone || "")}</div>
                  <div style="color:#475569;">${esc(billingLine)}</div>
                </div>
                <div style="flex:1;min-width:260px;padding:14px;border:1px solid #eef2f7;border-radius:12px;">
                  <div style="font-weight:800;color:#0f172a;margin-bottom:6px;">Livrare</div>
                  <div style="color:#0f172a;">${esc(shipping?.name || "")}</div>
                  <div style="color:#475569;">${esc(shipping?.phone || "")}</div>
                  <div style="color:#475569;">${esc(shippingLine)}</div>
                </div>
              </div>

              ${companyHtml}

              ${
                order.comment
                  ? `<div style="margin-top:12px;padding:14px;border:1px solid #eef2f7;border-radius:12px;background:#fff;">
                      <div style="font-weight:800;color:#0f172a;margin-bottom:6px;">Comentariu client</div>
                      <div style="color:#334155;white-space:pre-wrap;">${esc(order.comment)}</div>
                    </div>`
                  : ""
              }

              <div style="margin-top:18px;display:flex;align-items:center;gap:12px;flex-wrap:wrap;">
                <a href="${adminOrderUrl}" style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;font-weight:700;font-size:13px;padding:10px 14px;border-radius:10px;">Vezi comanda în admin</a>
                <div style="color:#64748b;font-size:12px;">${createdAt ? `Plasată la: ${esc(createdAt)}` : ""}</div>
              </div>
                          </td>
                        </tr>
                        <tr>
                          <td bgcolor="#f8fafc" style="background:#f8fafc;padding:14px 20px;border-top:1px solid #eef2f7;color:#64748b;font-size:12px;">
                            Notificare automată Smart Lock • ${esc(baseUrl)}
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>`;

    const customerHtml = `
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width,initial-scale=1" />
          <meta name="color-scheme" content="light" />
          <meta name="supported-color-schemes" content="light" />
          <title>${esc(customerSubject)}</title>
        </head>
        <body style="margin:0;padding:0;background:#0b0f19;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor="#0b0f19" style="background:#0b0f19;">
            <tr>
              <td align="center" style="padding:24px 12px;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="680" style="max-width:680px;width:100%;">
                  <tr>
                    <td style="background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid rgba(17,24,39,0.10);">
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                        <tr>
                          <td bgcolor="#0b0f19" style="background:#0b0f19;padding:18px 20px;">
                            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                              <tr>
                                <td align="left" valign="middle">
                                  <img src="${logoUrl}" alt="Smart Lock" width="170" style="display:block;max-width:170px;height:auto;" />
                                </td>
                                <td align="right" valign="middle" style="text-align:right;">
                                  <div style="color:#e2e8f0;font-size:12px;letter-spacing:.08em;text-transform:uppercase;">Confirmare comandă</div>
                                  <div style="color:#ffffff;font-size:14px;font-weight:700;">${esc(order.id)}</div>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding:20px;">
              <div style="padding:14px;border:1px solid #eef2f7;border-radius:12px;background:#f8fafc;">
                <div style="font-weight:800;color:#0f172a;">Comanda ta a fost plasată cu succes.</div>
                <div style="color:#475569;font-size:13px;margin-top:6px;">
                  Îți mulțumim! Revenim în cel mai scurt timp pentru confirmare și procesare.
                </div>
              </div>

              <div style="margin-top:16px;display:flex;flex-wrap:wrap;gap:12px;">
                <div style="flex:1;min-width:220px;padding:14px;border:1px solid #eef2f7;border-radius:12px;background:#fff;">
                  <div style="color:#64748b;font-size:12px;">Total</div>
                  <div style="font-size:22px;font-weight:800;color:#0f172a;">${esc(
                    formatMoney(order.total_amount)
                  )}</div>
                  <div style="color:#475569;font-size:12px;margin-top:6px;">Transport: ${esc(
                    formatMoney(order.shipping_cost || 0)
                  )}</div>
                </div>
                <div style="flex:1;min-width:220px;padding:14px;border:1px solid #eef2f7;border-radius:12px;background:#fff;">
                  <div style="color:#64748b;font-size:12px;">Livrare</div>
                  <div style="font-size:14px;font-weight:700;color:#0f172a;">${esc(
                    order.shipping_method || ""
                  )}</div>
                  <div style="color:#64748b;font-size:12px;margin-top:10px;">Plată</div>
                  <div style="font-size:14px;font-weight:700;color:#0f172a;">${esc(
                    order.payment_provider || ""
                  )}</div>
                </div>
              </div>

              <div style="margin-top:16px;">
                <div style="font-size:14px;font-weight:800;color:#0f172a;margin-bottom:8px;">Produse</div>
                <div style="border:1px solid #eef2f7;border-radius:12px;overflow:hidden;">
                  <table style="border-collapse:collapse;width:100%;font-size:13px;color:#0f172a;">
                    <thead>
                      <tr style="background:#f1f5f9;">
                        <th style="padding:10px 12px;text-align:left;">Produs</th>
                        <th style="padding:10px 12px;text-align:center;white-space:nowrap;">Cant.</th>
                        <th style="padding:10px 12px;text-align:right;white-space:nowrap;">Preț</th>
                        <th style="padding:10px 12px;text-align:right;white-space:nowrap;">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${itemsRowsHtml}
                    </tbody>
                  </table>
                </div>
              </div>

              <div style="margin-top:16px;display:flex;flex-wrap:wrap;gap:12px;">
                <div style="flex:1;min-width:260px;padding:14px;border:1px solid #eef2f7;border-radius:12px;background:#fff;">
                  <div style="font-weight:800;color:#0f172a;margin-bottom:6px;">Facturare</div>
                  <div style="color:#0f172a;">${esc(billing?.name || "")}</div>
                  <div style="color:#475569;">${esc(billing?.phone || "")}</div>
                  <div style="color:#475569;">${esc(billingLine)}</div>
                </div>
                <div style="flex:1;min-width:260px;padding:14px;border:1px solid #eef2f7;border-radius:12px;background:#fff;">
                  <div style="font-weight:800;color:#0f172a;margin-bottom:6px;">Livrare</div>
                  <div style="color:#0f172a;">${esc(shipping?.name || "")}</div>
                  <div style="color:#475569;">${esc(shipping?.phone || "")}</div>
                  <div style="color:#475569;">${esc(shippingLine)}</div>
                </div>
              </div>

              <div style="margin-top:18px;display:flex;align-items:center;gap:12px;flex-wrap:wrap;">
                <a href="${orderConfirmationUrl}" style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;font-weight:700;font-size:13px;padding:10px 14px;border-radius:10px;">Vezi confirmarea comenzii</a>
                <div style="color:#64748b;font-size:12px;">${createdAt ? `Plasată la: ${esc(createdAt)}` : ""}</div>
              </div>

              <div style="margin-top:16px;padding:14px;border:1px solid #eef2f7;border-radius:12px;background:#f8fafc;">
                <div style="font-weight:800;color:#0f172a;margin-bottom:6px;">Ai nevoie de ajutor?</div>
                <div style="color:#475569;font-size:13px;">
                  Ne poți contacta la <a href="mailto:${esc(adminEmail)}" style="color:#2563eb;text-decoration:none;">${esc(
                    adminEmail
                  )}</a> sau telefon <strong style="color:#0f172a;">0741119449</strong>.
                </div>
              </div>
                          </td>
                        </tr>
                        <tr>
                          <td bgcolor="#f8fafc" style="background:#f8fafc;padding:14px 20px;border-top:1px solid #eef2f7;color:#64748b;font-size:12px;">
                            Smart Lock • ${esc(baseUrl)}
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>`;

    const customerText = [
      `Confirmare comandă: ${order.id}`,
      createdAt ? `Data: ${createdAt}` : "",
      `Total: ${formatMoney(order.total_amount)}`,
      `Transport: ${formatMoney(order.shipping_cost || 0)}`,
      `Metodă livrare: ${order.shipping_method || ""}`,
      `Plată: ${order.payment_provider || ""}`,
      "",
      "Produse:",
      ...lines,
      "",
      `Facturare: ${billing?.name || ""} | ${billing?.phone || ""} | ${billing?.line1 || ""}, ${billing?.city || ""} ${billing?.county || ""} ${billing?.postal_code || ""}`,
      `Livrare: ${shipping?.name || ""} | ${shipping?.phone || ""} | ${shipping?.line1 || ""}, ${shipping?.city || ""} ${shipping?.county || ""} ${shipping?.postal_code || ""}`,
      "",
      `Vezi confirmarea: ${orderConfirmationUrl}`,
      "",
      `Suport: ${adminEmail} | 0741119449`,
    ]
      .filter(Boolean)
      .join("\n");

    async function sendEmail(payload: any) {
      const resp = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const bodyText = await resp.text().catch(() => "");
      return { ok: resp.ok, status: resp.status, bodyText };
    }

    const adminPayload = {
      from: emailFrom,
      to: [adminEmail],
      subject,
      text,
      html,
      ...(replyTo ? { reply_to: replyTo } : {}),
    };

    const customerPayload = customerEmail
      ? {
          from: emailFrom,
          to: [customerEmail],
          subject: customerSubject,
          text: customerText,
          html: customerHtml,
          ...(replyTo ? { reply_to: replyTo } : {}),
        }
      : null;

    const [adminSend, customerSend] = await Promise.all([
      sendEmail(adminPayload),
      customerPayload ? sendEmail(customerPayload) : Promise.resolve(null),
    ]);

    if (!adminSend.ok) {
      console.error("[order-notification] Admin email send failed", {
        status: adminSend.status,
        body: adminSend.bodyText,
      });
      return NextResponse.json(
        { error: "Email send failed", details: adminSend.bodyText },
        { status: 502 }
      );
    }

    if (customerSend && !customerSend.ok) {
      console.error("[order-notification] Customer email send failed", {
        status: customerSend.status,
        body: customerSend.bodyText,
      });
    }

    console.log("[order-notification] Email sent", {
      orderId,
      adminEmail,
      customerEmail: customerEmail || null,
    });

    return NextResponse.json({
      ok: true,
      admin: { ok: adminSend.ok, status: adminSend.status },
      customer: customerSend
        ? { ok: customerSend.ok, status: customerSend.status }
        : null,
    });
  } catch (e: any) {
    console.error("[order-notification] Unexpected error", e);
    return NextResponse.json(
      { error: "Unexpected error", details: e?.message || String(e) },
      { status: 500 }
    );
  }
}
