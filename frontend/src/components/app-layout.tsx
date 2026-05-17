import { Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LayoutDashboard, Folder, CheckSquare, Users, Activity, Settings, Search, Bell, Sun, Moon, Plus, Menu, X, ChevronDown, LogOut, User as UserIcon, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { useApp } from "@/lib/app-context";
import { cn } from "@/lib/utils";
import { roleLabel } from "@/lib/formatters";

const nav = [
  { to: "/app/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/app/projects", label: "Projects", icon: Folder },
  { to: "/app/tasks", label: "Tasks", icon: CheckSquare },
  { to: "/app/team", label: "Team", icon: Users },
  { to: "/app/activity", label: "Activity", icon: Activity },
  { to: "/app/settings", label: "Settings", icon: Settings },
] as const;

export function AppLayout() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { user, isLoading } = useApp();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate({ to: "/login" });
    }
  }, [isLoading, user, navigate]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">
        Loading workspace…
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <Sidebar mobile={false} />
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-foreground/30" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-64 bg-sidebar border-r border-sidebar-border">
            <Sidebar mobile onClose={() => setOpen(false)} />
          </div>
        </div>
      )}
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar onMenu={() => setOpen(true)} />
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-[1400px] w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function Sidebar({ mobile, onClose }: { mobile: boolean; onClose?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <aside className={cn(
      "bg-sidebar text-sidebar-foreground border-r border-sidebar-border flex-col w-64 shrink-0",
      mobile ? "flex h-full" : "hidden lg:flex"
    )}>
      <div className="h-16 px-5 flex items-center justify-between border-b border-sidebar-border">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <div className="h-8 w-8 rounded-lg bg-primary text-primary-foreground grid place-items-center">
            <CheckSquare className="h-4 w-4" />
          </div>
          Teamline
        </Link>
        {mobile && (
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
        )}
      </div>
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        <div className="px-3 pt-2 pb-1 text-[11px] uppercase tracking-wider text-sidebar-foreground/50 font-medium">Workspace</div>
        {nav.map((item) => {
          const active = pathname === item.to || pathname.startsWith(item.to + "/");
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
     
    </aside>
  );
}

function TopBar({ onMenu }: { onMenu: () => void }) {
  const { user, role, theme, toggleTheme, logout } = useApp();
  const navigate = useNavigate();
  return (
    <header className="h-16 border-b border-border bg-card/60 backdrop-blur sticky top-0 z-30">
      <div className="h-full px-4 sm:px-6 lg:px-8 flex items-center gap-3">
        <button onClick={onMenu} className="lg:hidden p-2 -ml-2 text-muted-foreground hover:text-foreground"><Menu className="h-5 w-5" /></button>
        <div className="flex-1 max-w-md hidden sm:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search projects, tasks, people…" className="pl-9 bg-background border-border h-9" />
          </div>
        </div>
        <div className="flex-1 sm:hidden" />
        <Badge variant="outline" className={cn(
          "gap-1 hidden sm:inline-flex",
          role === "ADMIN" ? "border-primary/30 text-primary bg-primary/10" : "border-border text-muted-foreground"
        )}>
          <Shield className="h-3 w-3" /> {role ? roleLabel(role) : "Member"}
        </Badge>
        <Button variant="ghost" size="icon" onClick={toggleTheme} className="text-muted-foreground hover:text-foreground" aria-label="Toggle theme">
          {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        </Button>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground relative" aria-label="Notifications">
              <Bell className="h-4 w-4" />
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-destructive ring-2 ring-card" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 p-0">
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <div className="font-medium text-sm">Notifications</div>
              <button className="text-xs text-muted-foreground hover:text-foreground">Mark all read</button>
            </div>
            <div className="max-h-80 overflow-y-auto divide-y divide-border">
              {[
                { t: "Priya completed “Audit color contrast tokens”", w: "2h ago" },
                { t: "Daniel moved “Empty state illustrations” to Review", w: "5h ago" },
                { t: "New comment on “Build offline sync queue”", w: "Yesterday" },
                { t: "Marcus assigned you a task in Atlas Web Platform", w: "2d ago" },
              ].map((n, i) => (
                <div key={i} className="px-4 py-3 hover:bg-muted/50">
                  <div className="text-sm">{n.t}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{n.w}</div>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-md hover:bg-muted">
              <Avatar className="h-8 w-8"><AvatarFallback className="bg-primary text-primary-foreground text-xs font-medium">{user.initials}</AvatarFallback></Avatar>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground hidden sm:block" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="font-medium">{user.name}</div>
              <div className="text-xs text-muted-foreground font-normal">{user.email}</div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild><Link to="/app/settings"><UserIcon className="h-4 w-4 mr-2" /> Profile & settings</Link></DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={async () => {
                await logout();
                navigate({ to: "/login" });
              }}
            >
              <LogOut className="h-4 w-4 mr-2" /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

export function PageHeader({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {action && <div className="flex gap-2 flex-wrap">{action}</div>}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, description, action }: { icon: React.ComponentType<{ className?: string }>; title: string; description: string; action?: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card/50 px-6 py-16 text-center">
      <div className="mx-auto h-12 w-12 rounded-xl bg-accent text-accent-foreground grid place-items-center">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mt-4 font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground max-w-sm mx-auto">{description}</p>
      {action && <div className="mt-6 flex justify-center">{action}</div>}
    </div>
  );
}

export function QuickActionButton({ icon: Icon, label, onClick, variant = "default" }: { icon: React.ComponentType<{ className?: string }>; label: string; onClick?: () => void; variant?: "default" | "outline" }) {
  return (
    <Button variant={variant} onClick={onClick} className="gap-1.5">
      <Icon className="h-4 w-4" /> {label}
    </Button>
  );
}

export { Plus };
