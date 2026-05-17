import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AuthShell, Field, AuthLink } from "@/components/auth-shell";
import { toast } from "sonner";
import { AuthApi } from "@/lib/api";
import { useApp } from "@/lib/app-context";

export const Route = createFileRoute("/login")({ component: LoginPage });

function LoginPage() {
  const navigate = useNavigate();
  const { setAuth } = useApp();
  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to your workspace to continue."
      cta="Sign in"
      onSubmit={async (e) => {
        e.preventDefault();
        const form = new FormData(e.currentTarget);
        try {
          const data = await AuthApi.login({
            email: String(form.get("email")),
            password: String(form.get("password")),
          });
          setAuth(data.token, data.user);
          toast.success("Signed in");
          navigate({ to: "/app/dashboard" });
        } catch (error) {
          toast.error(error instanceof Error ? error.message : "Sign in failed");
        }
      }}
      footer={<>New to Teamline? <AuthLink to="/signup">Create an account</AuthLink></>}
    >
      <Field label="Work email" name="email" type="email" placeholder="you@company.com" defaultValue="alex@acme.co" required />
      <Field label="Password" name="password" type="password" placeholder="••••••••" defaultValue="demo-pass" required />
      <div className="flex justify-end -mt-1">
        <AuthLink to="/forgot-password">Forgot password?</AuthLink>
      </div>
    </AuthShell>
  );
}
