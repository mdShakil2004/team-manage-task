import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { CheckSquare, ArrowRight, Layers, Users, BarChart3, ShieldCheck, Sparkles, Zap } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/60 backdrop-blur sticky top-0 z-30 bg-background/80">
        <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <div className="h-8 w-8 rounded-lg bg-primary text-primary-foreground grid place-items-center">
              <CheckSquare className="h-4 w-4" />
            </div>
            Teamline
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground">Features</a>
            <a href="#workflow" className="hover:text-foreground">Workflow</a>
            <a href="#roles" className="hover:text-foreground">Roles</a>
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild><Link to="/login">Log in</Link></Button>
            <Button asChild><Link to="/signup">Get started</Link></Button>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(60%_60%_at_50%_0%,oklch(0.95_0.05_258)_0%,transparent_60%)] dark:bg-[radial-gradient(60%_60%_at_50%_0%,oklch(0.3_0.06_258)_0%,transparent_60%)]" />
        <div className="mx-auto max-w-7xl px-6 pt-24 pb-20 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-card text-xs text-muted-foreground mb-8">
            <Sparkles className="h-3.5 w-3.5 text-primary" /> Built for fast-moving product teams
          </div>
          <h1 className="text-5xl md:text-6xl font-semibold tracking-tight max-w-4xl mx-auto text-balance">
            Plan projects, assign tasks, and ship together — calmly.
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
            Teamline is the internal task manager that gives admins control and members clarity. No clutter, no busywork — just the shipping rhythm your team already wants.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Button size="lg" asChild><Link to="/signup">Start free <ArrowRight className="ml-1 h-4 w-4" /></Link></Button>
            <Button size="lg" variant="outline" asChild><Link to="/app/dashboard">View live demo</Link></Button>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">No credit card required · 14-day trial · SSO available</p>

          <div className="mt-16 mx-auto max-w-5xl rounded-2xl border border-border bg-card shadow-[var(--shadow-elevated)] overflow-hidden">
            <div className="h-9 bg-muted/60 border-b border-border flex items-center gap-1.5 px-4">
              <span className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
              <span className="h-2.5 w-2.5 rounded-full bg-warning/60" />
              <span className="h-2.5 w-2.5 rounded-full bg-success/60" />
            </div>
            <div className="grid md:grid-cols-4 gap-0 text-left">
              <div className="bg-sidebar border-r border-border p-4 hidden md:block">
                <div className="text-xs font-medium text-sidebar-foreground/60 mb-3 uppercase tracking-wider">Workspace</div>
                {["Dashboard","Projects","Tasks","Team","Activity","Settings"].map((n,i) => (
                  <div key={n} className={`px-3 py-2 rounded-md text-sm mb-1 ${i===0 ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground/80"}`}>{n}</div>
                ))}
              </div>
              <div className="md:col-span-3 p-6 space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    {l:"Projects",v:"12"},{l:"Tasks",v:"148"},{l:"Done",v:"96"},{l:"Overdue",v:"7"},
                  ].map((s)=>(
                    <div key={s.l} className="rounded-xl border border-border p-3">
                      <div className="text-xs text-muted-foreground">{s.l}</div>
                      <div className="text-2xl font-semibold mt-1">{s.v}</div>
                    </div>
                  ))}
                </div>
                <div className="rounded-xl border border-border p-4">
                  <div className="text-sm font-medium mb-3">Tasks by status</div>
                  <div className="flex gap-1.5 h-3 rounded-full overflow-hidden">
                    <div className="bg-muted-foreground/30 flex-[3]" />
                    <div className="bg-info flex-[4]" />
                    <div className="bg-warning flex-[2]" />
                    <div className="bg-success flex-[5]" />
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-xs text-muted-foreground mt-3">
                    <div>Todo</div><div>In Progress</div><div>Review</div><div>Done</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-7xl px-6 py-24 border-t border-border">
        <h2 className="text-3xl md:text-4xl font-semibold tracking-tight max-w-2xl">Everything a focused team needs. Nothing it doesn't.</h2>
        <p className="mt-4 text-muted-foreground max-w-xl">From the first project to the hundredth, Teamline keeps work visible without becoming a second job.</p>
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          {[
            {icon: Layers, title:"Projects with shape", body:"Group work into projects with owners, timelines, and progress that updates as tasks close."},
            {icon: CheckSquare, title:"Tasks the team trusts", body:"Status, priority, assignee, due date. Inline edits. Kanban or table. Whatever fits the moment."},
            {icon: Users, title:"Roles done right", body:"Admins steer. Members focus on their work. Permissions are obvious, not surprising."},
            {icon: BarChart3, title:"Dashboards that matter", body:"Executive overview at a glance — overdue, in flight, and what's coming next week."},
            {icon: ShieldCheck, title:"Quiet by default", body:"Smart notifications, calm colors, and zero noise. Open the app, do the work, close the app."},
            {icon: Zap, title:"Fast everywhere", body:"Snappy on a laptop, smooth on a phone. Made for the way teams actually work."},
          ].map(({icon: Icon, title, body}) => (
            <div key={title} className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]">
              <div className="h-10 w-10 rounded-lg bg-accent text-accent-foreground grid place-items-center mb-4">
                <Icon className="h-5 w-5" />
              </div>
              <div className="font-medium">{title}</div>
              <p className="mt-1 text-sm text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="roles" className="bg-muted/40 border-t border-border">
        <div className="mx-auto max-w-7xl px-6 py-24 grid md:grid-cols-2 gap-12 items-start">
          <div>
            <div className="text-xs uppercase tracking-wider text-primary font-medium">Role-based</div>
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mt-2">Admins steer. Members ship.</h2>
            <p className="mt-4 text-muted-foreground">Permissions are designed around what your team actually does — not a 40-row checkbox matrix.</p>
          </div>
          <div className="space-y-4">
            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="text-sm font-medium">Admin</div>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li>· Create, edit, and delete projects</li>
                <li>· Invite members and assign roles</li>
                <li>· Assign tasks across the team</li>
                <li>· Full access to dashboards and reports</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="text-sm font-medium">Member</div>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li>· See projects they're a part of</li>
                <li>· Focus on tasks assigned to them</li>
                <li>· Update status on their own tasks</li>
                <li>· Stay out of admin surfaces by default</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-24 text-center">
        <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">Ready to give your team a calmer week?</h2>
        <p className="mt-4 text-muted-foreground max-w-xl mx-auto">Spin up a workspace in under a minute. Invite your team. Watch the overdue list shrink.</p>
        <div className="mt-8 flex justify-center gap-3">
          <Button size="lg" asChild><Link to="/signup">Create your workspace</Link></Button>
          <Button size="lg" variant="outline" asChild><Link to="/app/dashboard">Open demo</Link></Button>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto max-w-7xl px-6 py-10 flex flex-col md:flex-row gap-4 items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-primary text-primary-foreground grid place-items-center">
              <CheckSquare className="h-3.5 w-3.5" />
            </div>
            © 2026 Teamline
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-foreground">Privacy</a>
            <a href="#" className="hover:text-foreground">Terms</a>
            <a href="#" className="hover:text-foreground">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
