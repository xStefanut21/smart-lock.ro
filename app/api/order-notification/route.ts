import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    const resendApiKey = process.env.RESEND_API_KEY;
    const adminEmail = process.env.ADMIN_EMAIL;
    const emailFrom = process.env.EMAIL_FROM;

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
      .select("quantity, unit_price, color, products(name)")
      .eq("order_id", orderId);

    const formatMoney = (value: number) =>
      new Intl.NumberFormat("ro-RO", {
        style: "currency",
        currency: "RON",
      }).format(value);

    const lines = (items || []).map((row: any) => {
      const name = row.products?.name ?? "Produs";
      const color = row.color ? ` (${row.color})` : "";
      const qty = typeof row.quantity === "number" ? row.quantity : 0;
      const unit = typeof row.unit_price === "number" ? row.unit_price : 0;
      const lineTotal = qty * unit;
      return `- ${name}${color} x${qty} = ${formatMoney(lineTotal)}`;
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

    const resendResp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: emailFrom,
        to: [adminEmail],
        subject,
        text,
      }),
    });

    if (!resendResp.ok) {
      const errText = await resendResp.text().catch(() => "");
      console.error("[order-notification] Resend send failed", {
        status: resendResp.status,
        body: errText,
      });
      return NextResponse.json(
        { error: "Email send failed", details: errText },
        { status: 502 }
      );
    }

    console.log("[order-notification] Email sent", { orderId, adminEmail });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("[order-notification] Unexpected error", e);
    return NextResponse.json(
      { error: "Unexpected error", details: e?.message || String(e) },
      { status: 500 }
    );
  }
}
