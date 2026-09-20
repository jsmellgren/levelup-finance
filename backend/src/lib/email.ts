// Sends transactional email via Resend's HTTP API directly (no SDK dependency needed).
// If RESEND_API_KEY isn't set, falls back to logging the reset link to the console —
// so password reset is still fully testable locally without signing up for anything.

const FRONTEND_URL = process.env.FRONTEND_URL ?? "http://localhost:5173";

export async function sendPasswordResetEmail(to: string, token: string) {
  const resetUrl = `${FRONTEND_URL}/reset-password?token=${token}`;

  if (!process.env.RESEND_API_KEY) {
    console.log(`\n[email] Password reset link for ${to}:\n${resetUrl}\n`);
    return;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM ?? "LevelUp Finance <onboarding@resend.dev>",
      to,
      subject: "Reset your LevelUp Finance password",
      html: `<p>Click the link below to reset your password. This link expires in 1 hour.</p><p><a href="${resetUrl}">${resetUrl}</a></p>`,
    }),
  });

  if (!res.ok) {
    console.error("[email] Failed to send password reset email", await res.text());
  }
}