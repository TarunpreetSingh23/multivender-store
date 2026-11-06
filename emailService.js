
import nodemailer from "nodemailer";

// ==========================================
// EMAIL CONFIGURATION
// ==========================================

const getEmailTransporter = () => {
  const user = (
    process.env.SMTP_USER || process.env.EMAIL_USER || ""
  ).trim();

  const pass = (
    process.env.SMTP_PASS || process.env.EMAIL_PASS || ""
  ).replace(/\s+/g, "");

  if (!user || !pass) {
    throw new Error("Missing EMAIL_USER or EMAIL_PASS environment variables.");
  }

  // Custom SMTP configuration, if provided
  if (process.env.SMTP_HOST) {
    const port = Number(process.env.SMTP_PORT || 587);

    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465,
      auth: { user, pass },
      connectionTimeout: 15000,
      greetingTimeout: 15000,
      socketTimeout: 20000,
    });
  }

  // Default Gmail configuration
  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: { user, pass },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 20000,
  });
};

// ==========================================
// HTML SECURITY HELPER
// ==========================================

const escapeHTML = (value = "") => {
  return String(value).replace(/[&<>"']/g, (char) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return entities[char];
  });
};

// ==========================================
// SEND OTP EMAIL
// ==========================================

export const sendOtpEmail = async ({ to, name, otp }) => {
  try {
    // Validate email configuration
    const user = (
      process.env.SMTP_USER || process.env.EMAIL_USER || ""
    ).trim();

    if (!user) {
      throw new Error("Email sender is not configured.");
    }

    // Validate recipient
    if (
      typeof to !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to.trim())
    ) {
      throw new Error("Invalid recipient email address.");
    }

    // Validate OTP
    const cleanOTP = String(otp ?? "").trim();

    if (!/^\d{6}$/.test(cleanOTP)) {
      throw new Error("OTP must be exactly 6 digits.");
    }

    // Escape user-provided name
    const safeName = escapeHTML(
      typeof name === "string"
        ? name.trim().split(/\s+/)[0]
        : "Customer"
    );

    const currentYear = new Date().getFullYear();

    const transporter = getEmailTransporter();

    const fromAddress = process.env.EMAIL_FROM
      ? process.env.EMAIL_FROM
      : `"MarketNest Security" <${user}>`;

    // ======================================
    // RESPONSIVE HTML EMAIL
    // ======================================

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MarketNest Verification Code</title>
</head>

<body style="
  margin:0;
  padding:0;
  background-color:#F8F5EC;
  font-family:Arial,Helvetica,sans-serif;
  color:#202824;
">

  <table
    width="100%"
    cellpadding="0"
    cellspacing="0"
    border="0"
    style="background-color:#F8F5EC;padding:35px 12px;"
  >
    <tr>
      <td align="center">

        <table
          width="100%"
          cellpadding="0"
          cellspacing="0"
          border="0"
          style="
            max-width:540px;
            background:#ffffff;
            border:1px solid #E6E0D2;
            border-radius:16px;
            overflow:hidden;
          "
        >

          <!-- HEADER -->

          <tr>
            <td
              align="center"
              style="
                background:#174C3C;
                padding:30px 20px;
                border-bottom:3px solid #D5B779;
              "
            >
              <h1 style="
                margin:0;
                color:#ffffff;
                font-family:Georgia,serif;
                font-size:27px;
              ">
                MarketNest<span style="color:#D5B779;">.</span>
              </h1>

              <p style="
                color:#D5B779;
                font-size:10px;
                letter-spacing:2px;
                text-transform:uppercase;
                margin:8px 0 0;
              ">
                Curated Marketplace Security
              </p>
            </td>
          </tr>

          <!-- CONTENT -->

          <tr>
            <td style="padding:32px 25px;">

              <h2 style="
                color:#202824;
                font-size:21px;
                margin:0 0 16px;
              ">
                Hello ${safeName},
              </h2>

              <p style="
                font-size:14px;
                color:#68736C;
                line-height:1.7;
                margin-bottom:24px;
              ">
                We received a request to reset your MarketNest
                account password. Use the verification code below
                to continue.
              </p>

              <!-- OTP BOX -->

              <table
                width="100%"
                cellpadding="0"
                cellspacing="0"
                style="
                  background:#F8F5EC;
                  border:2px dashed #D5B779;
                  border-radius:12px;
                  margin:20px 0;
                "
              >
                <tr>
                  <td align="center" style="padding:22px 10px;">

                    <p style="
                      color:#174C3C;
                      font-size:11px;
                      font-weight:bold;
                      letter-spacing:1.5px;
                      margin:0 0 12px;
                    ">
                      YOUR VERIFICATION CODE
                    </p>

                    <h1 style="
                      color:#174C3C;
                      font-family:monospace;
                      font-size:34px;
                      letter-spacing:8px;
                      margin:0;
                    ">
                      ${cleanOTP}
                    </h1>

                  </td>
                </tr>
              </table>

              <!-- EXPIRY NOTICE -->

              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="
                    background:#E8EFE8;
                    border-left:3px solid #174C3C;
                    border-radius:5px;
                    padding:14px;
                    color:#174C3C;
                    font-size:13px;
                    line-height:1.6;
                  ">
                    <strong>Expiry Notice:</strong>
                    This OTP is valid for 10 minutes only.
                    Never share this code with anyone.
                    MarketNest staff will never ask for your OTP.
                  </td>
                </tr>
              </table>

              <p style="
                color:#68736C;
                font-size:12px;
                line-height:1.7;
                margin-top:24px;
              ">
                If you did not request a password reset,
                please ignore this email. Your account will
                remain unchanged.
              </p>

            </td>
          </tr>

          <!-- FOOTER -->

          <tr>
            <td align="center" style="
              background:#F8F5EC;
              border-top:1px solid #E6E0D2;
              padding:20px 15px;
            ">

              <p style="
                margin:4px 0;
                color:#68736C;
                font-size:11px;
              ">
                © ${currentYear} MarketNest Marketplace.
                All rights reserved.
              </p>

              <p style="
                margin:4px 0;
                color:#68736C;
                font-size:11px;
              ">
                Handcrafted quality &amp; character from
                independent artisans across India.
              </p>

            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>
`;

    // ======================================
    // SEND EMAIL
    // ======================================

    const info = await transporter.sendMail({
      from: fromAddress,
      to: to.trim().toLowerCase(),
      subject: "Your MarketNest Password Reset Code",

      text: `
Hello ${typeof name === "string" ? name : "Customer"},

Your MarketNest password reset verification code is:

${cleanOTP}

This OTP is valid for 10 minutes.

Never share this code with anyone.

If you did not request this password reset, please ignore this email.

MarketNest Team
      `,

      html,
    });

    console.log("MarketNest OTP email sent:", info.messageId);

    return {
      success: true,
      messageId: info.messageId,
    };

  } catch (error) {
    console.error("MarketNest email error:", error.message);
    throw error;
  }
};

// ==========================================
// DEFAULT EXPORT
// ==========================================

export default sendOtpEmail;
