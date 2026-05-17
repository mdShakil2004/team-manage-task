import { Link, type LinkProps } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckSquare } from "lucide-react";
import type { ReactNode, FormEvent } from "react";

interface Props {
  title: string;
  subtitle: string;
  children: ReactNode;
  cta: string;
  footer?: ReactNode;
  onSubmit: (e: FormEvent) => void;
}

export function AuthShell({ title, subtitle, children, cta, footer, onSubmit }: Props) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-primary/10 via-background to-accent/30 border-r border-border">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <div className="h-8 w-8 rounded-lg bg-primary text-primary-foreground grid place-items-center">
            <CheckSquare className="h-4 w-4" />
          </div>
          Teamline
        </Link>
        <div>
          <blockquote className="text-2xl font-medium leading-relaxed text-foreground/90 max-w-md">
            "Teamline replaced three tools for us. The team is calmer, deadlines slip less, and nobody misses the old chaos."
          </blockquote>
          <div className="mt-6 flex items-center gap-3 text-sm">
            <div className="h-10 w-10 rounded-full bg-primary/15 text-primary grid place-items-center font-semibold">EM</div>
            <div>
              <div className="font-medium">Erin Marshall</div>
              <div className="text-muted-foreground">Head of Product, Northwind</div>
            </div>
          </div>
        </div>
        <div className="text-xs text-muted-foreground">© 2026 Teamline · SOC 2 Type II</div>
      </div>
      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm">
          <Link to="/" className="lg:hidden flex items-center gap-2 font-semibold mb-8">
            <div className="h-8 w-8 rounded-lg bg-primary text-primary-foreground grid place-items-center">
              <CheckSquare className="h-4 w-4" />
            </div>
            Teamline
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            {children}
            <Button type="submit" className="w-full">{cta}</Button>
          </form>
          {footer && <div className="mt-6 text-sm text-center text-muted-foreground">{footer}</div>}
        </div>
      </div>
    </div>
  );
}

export function Field({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={props.id || props.name}>{label}</Label>
      <Input id={props.id || props.name} {...props} />
    </div>
  );
}

export function AuthLink({ to, children }: { to: LinkProps["to"]; children: ReactNode }) {
  return <Link to={to} className="text-primary font-medium hover:underline">{children}</Link>;
}
