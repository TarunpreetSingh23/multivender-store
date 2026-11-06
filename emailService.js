import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const escapeHtml = (value = "") =>
  String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[char]);

export const sendOtpEmail = async ({ to, name, otp }) => {
  try {
    if (!process.env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is missing");
    }

    const { data, error } = await resend.emails.send({
      from: "tarunpreets29@gmail.com",
      to: [to],
      subject: "Your MarketNest Verification Code",
      html: `
        <div style="font-family:Arial;padding:25px;">
          <h2>Hello ${escapeHtml(name || "Customer")},</h2>
          <p>Your MarketNest verification code is:</p>
          <h1 style="letter-spacing:8px;color:#145b46;">
            ${escapeHtml(otp)}
          </h1>
          <p>This OTP is valid for 10 minutes.</p>
          <p>Please do not share this code with anyone.</p>
          <p>Team MarketNest</p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend email error:", error);
      throw new Error(error.message);
    }

    console.log("MarketNest email sent:", data?.id);

    return data;
  } catch (error) {
    console.error("MarketNest email error:", error.message);
    throw error;
  }
};

export default sendOtpEmail;