import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AuthShell, Field, AuthLink } from "@/components/auth-shell";
import { toast } from "sonner";
import { AuthApi } from "@/lib/api";
import { useApp } from "@/lib/app-context";

export const Route = createFileRoute("/signup")({ component: SignupPage });

function SignupPage() {
  const navigate = useNavigate();
  const { setAuth } = useApp();
  return (
    <AuthShell
      title="Create your workspace"
      subtitle="Free for 14 days. No credit card required."
      cta="Create account"
      onSubmit={async (e) => {
        e.preventDefault();
        const form = new FormData(e.currentTarget);
        const first = String(form.get("first"));
        const last = String(form.get("last"));
        try {
          const data = await AuthApi.signup({
            name: `${first} ${last}`.trim(),
            email: String(form.get("email")),
            password: String(form.get("password")),
          });
          setAuth(data.token, data.user);
          toast.success("Workspace created");
          navigate({ to: "/app/dashboard" });
        } catch (error) {
          toast.error(error instanceof Error ? error.message : "Signup failed");
        }
      }}
      footer={<>Already have an account? <AuthLink to="/login">Sign in</AuthLink></>}
    >
      <div className="grid grid-cols-2 gap-3">
        <Field label="First name" name="first" placeholder="Alex" required />
        <Field label="Last name" name="last" placeholder="Morgan" required />
      </div>
      <Field label="Work email" name="email" type="email" placeholder="you@company.com" required />
      <Field label="Workspace name" name="workspace" placeholder="Acme Co." required />
      <Field label="Password" name="password" type="password" placeholder="At least 8 characters" required />
      <p className="text-xs text-muted-foreground">By creating an account you agree to our terms and privacy policy.</p>
    </AuthShell>
  );
}
