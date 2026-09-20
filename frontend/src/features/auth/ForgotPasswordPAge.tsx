import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { requestPasswordReset } from "../../api/auth";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await requestPasswordReset(email);
    } finally {
      setIsSubmitting(false);
      // Show the same message either way, so we don't leak whether the email exists.
      setSubmitted(true);
    }
  }

  return (
    <div className="flex min-h-screen flex-col justify-center px-6 py-12">
      <h1 className="mb-1 text-2xl font-bold">Reset your password</h1>
      <p className="mb-8 text-white/60">Enter your email and we'll send you a reset link.</p>

      {submitted ? (
        <p className="text-sm text-brand-teal">
          If an account exists for that email, a reset link is on its way. Check your inbox.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Sending..." : "Send Reset Link"}
          </Button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-white/50">
        <Link to="/login" className="text-brand-teal">
          Back to log in
        </Link>
      </p>
    </div>
  );
}