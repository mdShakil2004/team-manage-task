import { createFileRoute } from "@tanstack/react-router";
import { AuthShell, Field, AuthLink } from "@/components/auth-shell";
import { toast } from "sonner";

export const Route = createFileRoute("/forgot-password")({ component: ForgotPasswordPage });

function ForgotPasswordPage() {
  return (
    <AuthShell
      title="Reset your password"
      subtitle="We'll email you a link to set a new password."
      cta="Send reset link"
      onSubmit={(e) => { e.preventDefault(); toast.success("If an account exists, a reset link is on its way."); }}
      footer={<>Remembered it? <AuthLink to="/login">Back to sign in</AuthLink></>}
    >
      <Field label="Work email" name="email" type="email" placeholder="you@company.com" required />
    </AuthShell>
  );
}
