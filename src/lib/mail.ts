import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const APP_NAME = "DevStash";
const FROM_EMAIL = "DevStash <onboarding@resend.dev>";

export async function sendVerificationEmail(email: string, token: string) {
  const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/verify-email?token=${token}`;

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: [email],
    subject: `Verify your ${APP_NAME} email`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <div style="display: inline-block; background: #111; color: #fff; font-family: monospace; font-size: 14px; font-weight: 600; width: 40px; height: 40px; line-height: 40px; border-radius: 10px;">ds</div>
        </div>
        <h1 style="font-size: 24px; font-weight: 700; text-align: center; margin: 0 0 8px;">Verify your email</h1>
        <p style="color: #666; text-align: center; margin: 0 0 32px;">Click the button below to verify your email address and activate your ${APP_NAME} account.</p>
        <div style="text-align: center; margin-bottom: 32px;">
          <a href="${verifyUrl}" style="display: inline-block; background: #111; color: #fff; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-size: 14px; font-weight: 500;">Verify email address</a>
        </div>
        <p style="color: #999; font-size: 13px; text-align: center;">This link expires in 24 hours. If you didn't create a ${APP_NAME} account, you can ignore this email.</p>
      </div>
    `,
  });

  if (error) {
    console.error("[RESEND ERROR]", error);
    throw new Error(`Failed to send verification email: ${error.message}`);
  }
}
