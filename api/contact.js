import nodemailer from "nodemailer";

function json(res, status, payload) {
  return res.status(status).json(payload);
}

function escapeHtml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function infoRow(label, valueHtml) {
  return `
    <div style="display:flex;gap:12px;padding:8px 0;border-bottom:1px solid rgba(148,163,184,.12);">
      <div style="width:92px;min-width:92px;font-weight:900;color:rgba(255,255,255,.72);font-size:13px;">
        ${escapeHtml(label)}
      </div>
      <div style="flex:1;font-size:14px;color:rgba(255,255,255,.95);">
        ${valueHtml}
      </div>
    </div>
  `;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return json(res, 405, { ok: false, message: "Method not allowed" });
  }

  const { name, email, subject, message } = req.body || {};

  // Validate input
  if (!name || !email || !subject || !message) {
    return json(res, 400, { ok: false, message: "Please fill in all fields." });
  }

  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(String(email))) {
    return json(res, 400, { ok: false, message: "Please enter a valid email address." });
  }

  // ENV vars
  const SMTP_HOST = process.env.SMTP_HOST;
  const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
  const SMTP_USER = process.env.SMTP_USER;
  const SMTP_PASS = process.env.SMTP_PASS;
  const SMTP_FROM = process.env.SMTP_FROM;
  const CONTACT_TO_EMAIL = process.env.CONTACT_TO_EMAIL;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS || !SMTP_FROM || !CONTACT_TO_EMAIL) {
    return json(res, 500, {
      ok: false,
      message: "Server email configuration is missing. Please contact support.",
    });
  }

  // Sanitized values for HTML
  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeSubject = escapeHtml(subject);
  const safeMessage = escapeHtml(message);

  const submittedAt = new Date().toLocaleString("en-GB", {
    timeZone: "Asia/Colombo",
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

  // Modern HTML email
  const html = `
    <div style="background:#0b1220;padding:28px 12px;font-family:Inter,Segoe UI,Roboto,Arial,sans-serif;">
      <div style="max-width:680px;margin:0 auto;">
        
        <div style="
          background:linear-gradient(135deg,#22d3ee 0%,#0ea5e9 35%,#0284c7 100%);
          border-radius:18px;
          padding:18px 18px;
          color:#061018;
          box-shadow:0 18px 45px rgba(0,0,0,.25);
        ">
          <div style="font-size:12px;letter-spacing:.12em;text-transform:uppercase;font-weight:800;opacity:.9;">
            APSC 2026 Website
          </div>
          <div style="font-size:22px;font-weight:900;letter-spacing:-.02em;margin-top:4px;">
            New Contact Message
          </div>
          <div style="margin-top:6px;font-size:13px;opacity:.95;">
            Submitted on <b>${escapeHtml(submittedAt)}</b>
          </div>
        </div>

        <div style="
          margin-top:14px;
          background:rgba(255,255,255,.04);
          border:1px solid rgba(148,163,184,.18);
          border-radius:18px;
          padding:18px;
          color:rgba(255,255,255,.92);
          box-shadow:0 14px 34px rgba(0,0,0,.18);
        ">
          <div style="font-size:14px;opacity:.9;margin-bottom:12px;">
            You received a new message via the Contact & Location form.
          </div>

          <div style="
            display:block;
            border-radius:14px;
            background:rgba(2,6,23,.55);
            border:1px solid rgba(148,163,184,.14);
            padding:12px 12px;
            margin-bottom:14px;
          ">
            ${infoRow("Name", safeName)}
            ${infoRow(
              "Email",
              `<a href="mailto:${safeEmail}" style="color:#7dd3fc;text-decoration:none;font-weight:700">${safeEmail}</a>`
            )}
            ${infoRow("Subject", safeSubject)}
          </div>

          <div style="
            border-radius:14px;
            background:rgba(2,6,23,.35);
            border:1px solid rgba(148,163,184,.12);
            padding:14px 14px;
          ">
            <div style="font-size:12px;letter-spacing:.12em;text-transform:uppercase;font-weight:900;color:rgba(255,255,255,.72);margin-bottom:8px;">
              Message
            </div>
            <div style="white-space:pre-wrap;line-height:1.7;font-size:15px;color:rgba(255,255,255,.92);">
              ${safeMessage}
            </div>
          </div>

          <div style="margin-top:16px;display:flex;gap:10px;flex-wrap:wrap;">
            <a href="mailto:${safeEmail}?subject=${encodeURIComponent("Re: " + subject)}" style="
              display:inline-block;
              padding:10px 14px;
              border-radius:12px;
              background:rgba(34,211,238,.18);
              border:1px solid rgba(34,211,238,.35);
              color:#e6fbff;
              text-decoration:none;
              font-weight:800;
              font-size:14px;
            ">
              Reply to sender
            </a>

            <span style="
              display:inline-block;
              padding:10px 14px;
              border-radius:12px;
              background:rgba(255,255,255,.04);
              border:1px solid rgba(148,163,184,.14);
              color:rgba(255,255,255,.75);
              font-size:13px;
            ">
              Tip: You can also press “Reply” in your email client (Reply-To is set)
            </span>
          </div>
        </div>

        <div style="margin-top:14px;text-align:center;color:rgba(255,255,255,.55);font-size:12px;line-height:1.6;">
          <div style="margin-bottom:4px;">
            This email was generated automatically by the APSC 2026 website contact form.
          </div>
          <div>
            © APSC 2026 • Colombo, Sri Lanka
          </div>
        </div>

      </div>
    </div>
  `;

  // Plain text fallback
  const text =
    `New Contact Message — APSC 2026\n` +
    `Submitted: ${submittedAt}\n\n` +
    `Name: ${name}\n` +
    `Email: ${email}\n` +
    `Subject: ${subject}\n\n` +
    `Message:\n${message}\n`;

  try {
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: false, // STARTTLS on 587
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });

    await transporter.sendMail({
      from: `APSC 2026 Website <${SMTP_FROM}>`,
      to: CONTACT_TO_EMAIL,
      replyTo: email,
      subject: `[APSC 2026] ${subject}`,
      html,
      text,
    });

    return json(res, 200, { ok: true, message: "Message sent successfully." });
  } catch (err) {
    console.error("Brevo contact send failed:", err?.message || err);
    return json(res, 500, { ok: false, message: "Failed to send message. Please try again later." });
  }
}