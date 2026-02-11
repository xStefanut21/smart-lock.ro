import { NextResponse } from "next/server";

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 5;

const rateLimitBuckets = new Map<string, number[]>();

export async function POST(req: Request) {
  try {
    const resendApiKey = process.env.RESEND_API_KEY;
    const adminEmail = process.env.ADMIN_EMAIL || "stefan.prodan@monvelli.ro";
    const emailFrom = process.env.EMAIL_FROM;
    const replyToEnv = process.env.REPLY_TO;

    if (!resendApiKey || !emailFrom) {
      return NextResponse.json(
        { error: "Missing email environment variables." },
        { status: 500 }
      );
    }

    const ipHeader =
      req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "";
    const ip = (ipHeader.split(",")[0] || "").trim() || "unknown";

    const now = Date.now();
    const bucket = rateLimitBuckets.get(ip) || [];
    const fresh = bucket.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
    if (fresh.length >= RATE_LIMIT_MAX) {
      rateLimitBuckets.set(ip, fresh);
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }
    fresh.push(now);
    rateLimitBuckets.set(ip, fresh);

    const body = (await req.json().catch(() => ({}))) as {
      name?: string;
      email?: string;
      phone?: string;
      subject?: string;
      message?: string;
      honeypot?: string;
      elapsedMs?: number;
    };

    const name = (body.name || "").trim();
    const email = (body.email || "").trim();
    const phone = (body.phone || "").trim();
    const subjectRaw = (body.subject || "").trim();
    const message = (body.message || "").trim();
    const honeypot = (body.honeypot || "").trim();
    const elapsedMs = typeof body.elapsedMs === "number" ? body.elapsedMs : 0;

    if (honeypot) {
      return NextResponse.json({ ok: true });
    }

    if (elapsedMs > 0 && elapsedMs < 2000) {
      return NextResponse.json({ ok: true });
    }

    if (!name || name.length < 2 || name.length > 80) {
      return NextResponse.json(
        { error: "Numele trebuie să aibă între 2 și 80 caractere." },
        { status: 400 }
      );
    }

    if (!email || !email.includes("@") || email.length > 320) {
      return NextResponse.json(
        { error: "Email invalid." },
        { status: 400 }
      );
    }

    if (!phone) {
      return NextResponse.json(
        { error: "Numărul de telefon este obligatoriu." },
        { status: 400 }
      );
    }

    // Validare strictă pentru telefon românesc
    const phoneRegex = /^(\+4|0)?7[0-9]{8}$/;
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');

    if (!phoneRegex.test(cleanPhone)) {
      return NextResponse.json(
        { error: "Numărul de telefon nu este valid. Introdu un număr românesc valid (ex: 0741119449 sau +40741119449)." },
        { status: 400 }
      );
    }

    if (!subjectRaw || subjectRaw.length > 120) {
      return NextResponse.json(
        { error: "Subiectul trebuie să aibă maxim 120 caractere." },
        { status: 400 }
      );
    }

    if (message.length < 20 || message.length > 2000) {
      return NextResponse.json({ error: "Invalid message" }, { status: 400 });
    }

    if (!email.includes("@") || email.length > 320) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const safeSubject = subjectRaw || "Formular contact";

    const esc = (value: string) =>
      value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;")
        .replace(/'/g, "&#039;");

    const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <meta name="color-scheme" content="light" />
    <meta name="supported-color-schemes" content="light" />
    <title>${esc(safeSubject)}</title>
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
                      <div style="color:#e2e8f0;font-size:12px;letter-spacing:.08em;text-transform:uppercase;">Mesaj nou</div>
                      <div style="color:#ffffff;font-size:16px;font-weight:800;margin-top:2px;">Formular de contact</div>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:20px;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;">
                      <div style="font-size:13px;color:#334155;">Ai primit un mesaj nou de pe site.</div>

                      <div style="margin-top:14px;padding:14px;border:1px solid #eef2f7;border-radius:12px;background:#f8fafc;">
                        <div style="font-weight:800;color:#0f172a;margin-bottom:8px;">Detalii</div>
                        <div style="color:#0f172a;"><strong>Nume:</strong> ${esc(name)}</div>
                        <div style="color:#0f172a;margin-top:4px;"><strong>Email:</strong> <a href="mailto:${esc(email)}" style="color:#2563eb;text-decoration:none;">${esc(email)}</a></div>
                        ${phone ? `<div style="color:#0f172a;margin-top:4px;"><strong>Telefon:</strong> <a href="tel:${esc(phone)}" style="color:#2563eb;text-decoration:none;">${esc(phone)}</a></div>` : ''}
                        <div style="color:#0f172a;margin-top:4px;"><strong>Subiect:</strong> ${esc(safeSubject)}</div>
                      </div>

                      <div style="margin-top:12px;padding:14px;border:1px solid #eef2f7;border-radius:12px;background:#ffffff;">
                        <div style="font-weight:800;color:#0f172a;margin-bottom:8px;">Mesaj</div>
                        <div style="white-space:pre-wrap;color:#334155;font-size:13px;">${esc(message)}</div>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td bgcolor="#f8fafc" style="background:#f8fafc;padding:14px 20px;border-top:1px solid #eef2f7;color:#64748b;font-size:12px;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;">
                      Notificare automată Smart Lock • Formular contact
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

    const text = [
      "Mesaj nou - Formular contact",
      `Nume: ${name}`,
      `Email: ${email}`,
      `Subiect: ${safeSubject}`,
      "",
      message,
    ].join("\n");

    const replyTo = replyToEnv || email;

    const sendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: emailFrom,
        to: [adminEmail],
        subject: `[Contact] ${safeSubject}`,
        html,
        text,
        reply_to: replyTo,
      }),
    });

    if (!sendRes.ok) {
      const bodyText = await sendRes.text().catch(() => "");
      return NextResponse.json(
        { error: "Failed to send email", details: bodyText || undefined },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
