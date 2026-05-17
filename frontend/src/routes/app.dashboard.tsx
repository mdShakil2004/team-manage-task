import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/app-layout";
import { NewProjectDialog, NewTaskDialog, InviteMemberDialog } from "@/components/dialogs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { StatusBadge, PriorityBadge } from "@/components/status-badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DashboardApi, ProjectsApi } from "@/lib/api";
import { Folder, CheckSquare, CheckCircle2, AlertTriangle, ArrowRight, Calendar, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { useApp } from "@/lib/app-context";
import type { Project } from "@/lib/api-types";
import { getInitials, isOverdue, projectProgress, taskStatusLabel } from "@/lib/formatters";

export const Route = createFileRoute("/app/dashboard")({ component: DashboardPage });

function DashboardPage() {
  const { user, role } = useApp();
  const { data: summary, isLoading } = useQuery({ queryKey: ["dashboard-summary"], queryFn: DashboardApi.summary });
  const { data: overdue } = useQuery({ queryKey: ["dashboard-overdue"], queryFn: DashboardApi.overdue });
  const { data: projectData } = useQuery({ queryKey: ["projects", "dashboard"], queryFn: () => ProjectsApi.list({ page: 1, limit: 6, sortBy: "dueDate", sortOrder: "asc" }) });

  const statusData = useMemo(() => {
    if (!summary) return [];
    const counts = summary.tasksByStatus.reduce<Record<string, number>>((acc, entry) => {
      acc[entry.status] = entry._count._all;
      return acc;
    }, {});
    return Object.entries(taskStatusLabel).map(([status, label]) => ({ name: label, count: counts[status] ?? 0 }));
  }, [summary]);

  const myTasks = summary?.myAssignedTasks ?? [];
  const upcoming = myTasks.filter((task) => !isOverdue(task) && task.status !== "DONE").slice(0, 5);
  const overdueList = (overdue ?? []).slice(0, 4);
  const projects = projectData?.items ?? [];

  return (
    <>
      <PageHeader
        title={`Welcome back, ${user?.name.split(" ")[0] ?? ""}`}
        description="Here's where your team stands today."
        action={
          <>
            {role === "ADMIN" && <NewTaskDialog />}
            {role === "ADMIN" && <NewProjectDialog />}
            {role === "ADMIN" && <InviteMemberDialog />}
          </>
        }
      />

      {isLoading ? (
        <div className="text-sm text-muted-foreground">Loading dashboard…</div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard icon={Folder} label="Total projects" value={summary?.totalProjects ?? 0} hint="All projects" tone="default" />
            <StatCard icon={CheckSquare} label="Total tasks" value={summary?.totalTasks ?? 0} hint={`${(summary?.totalTasks ?? 0) - (summary?.completedTasks ?? 0)} open`} tone="default" />
            <StatCard icon={CheckCircle2} label="Completed" value={summary?.completedTasks ?? 0} hint="Completed tasks" tone="success" />
            <StatCard icon={AlertTriangle} label="Overdue" value={summary?.overdueTasks ?? 0} hint="Needs attention" tone="destructive" />
          </div>

          <div className="grid lg:grid-cols-3 gap-6 mb-6">
            <Card className="lg:col-span-2">
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle className="text-base">Tasks by status</CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">Across all active projects</p>
                </div>
                <Button variant="ghost" size="sm" asChild><Link to="/app/tasks">View all <ArrowRight className="h-3.5 w-3.5 ml-1" /></Link></Button>
              </CardHeader>
              <CardContent>
                <div className="h-[260px] -ml-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={statusData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                      <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={12} axisLine={false} tickLine={false} />
                      <YAxis stroke="var(--muted-foreground)" fontSize={12} axisLine={false} tickLine={false} allowDecimals={false} />
                      <Tooltip
                        contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--popover-foreground)", fontSize: 12 }}
                        cursor={{ fill: "var(--muted)" }}
                      />
                      <Bar dataKey="count" fill="var(--primary)" radius={[6,6,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Recent activity</CardTitle>
                <p className="text-xs text-muted-foreground">What your team's been up to</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {(summary?.recentActivity ?? []).slice(0, 6).map((a) => {
                  const name = a.user?.name ?? "Someone";
                  return (
                    <div key={a.id} className="flex gap-3">
                      <Avatar className="h-8 w-8 mt-0.5"><AvatarFallback className="text-[10px] bg-accent text-accent-foreground">{getInitials(name)}</AvatarFallback></Avatar>
                      <div className="min-w-0">
                        <div className="text-sm leading-snug"><span className="font-medium">{name}</span> <span className="text-muted-foreground">{a.action}</span> <span className="font-medium">{a.entityType}</span></div>
                        <div className="text-xs text-muted-foreground mt-0.5">{new Date(a.createdAt).toLocaleString()}</div>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle className="text-base">My assigned tasks</CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">Open tasks assigned to you</p>
                </div>
                <Button variant="ghost" size="sm" asChild><Link to="/app/tasks">All tasks <ArrowRight className="h-3.5 w-3.5 ml-1" /></Link></Button>
              </CardHeader>
              <CardContent className="p-0">
                {myTasks.length === 0 ? (
                  <div className="px-6 py-10 text-center text-sm text-muted-foreground"><Sparkles className="h-5 w-5 mx-auto mb-2 text-success" /> All caught up. Nice work.</div>
                ) : (
                  <div className="divide-y divide-border">
                    {myTasks.map(t => (
                      <div key={t.id} className="px-6 py-3 flex items-center gap-4 hover:bg-muted/40">
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-sm truncate">{t.title}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">{t.project?.name}</div>
                        </div>
                        <PriorityBadge priority={t.priority} />
                        <StatusBadge status={t.status} />
                        <div className="text-xs text-muted-foreground tabular-nums hidden sm:block w-20 text-right">{formatDate(t.dueDate)}</div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2"><Calendar className="h-4 w-4 text-info" /> Upcoming deadlines</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {upcoming.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No upcoming deadlines this week.</p>
                  ) : upcoming.map(t => (
                    <div key={t.id} className="flex items-start gap-3">
                      <div className="h-9 w-9 rounded-md bg-muted text-muted-foreground grid place-items-center text-[10px] font-semibold uppercase">{formatDateShort(t.dueDate)}</div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium truncate">{t.title}</div>
                        <div className="text-xs text-muted-foreground truncate">{t.project?.name}</div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-destructive/30">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2 text-destructive"><AlertTriangle className="h-4 w-4" /> Overdue highlights</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {overdueList.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Nothing overdue. Excellent.</p>
                  ) : overdueList.map(t => (
                    <div key={t.id} className="rounded-md border border-destructive/30 bg-destructive/5 p-3">
                      <div className="text-sm font-medium">{t.title}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{t.project?.name} · Assigned to {t.assignedTo?.name ?? "Unassigned"}</div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="mt-6 grid sm:grid-cols-3 gap-3">
            <ProjectMini projects={projects.slice(0, 3)} />
          </div>
        </>
      )}
    </>
  );
}

function ProjectMini({ projects }: { projects: Project[] }) {
  return projects.map(p => {
    const progress = projectProgress(p);
    return (
      <Link key={p.id} to="/app/projects/$projectId" params={{ projectId: p.id }} className="group rounded-xl border border-border bg-card p-4 hover:border-primary/40 hover:shadow-[var(--shadow-soft)] transition">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium truncate">{p.name}</div>
          <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition" />
        </div>
        <Progress value={progress.progress} className="mt-3 h-1.5" />
        <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
          <span>{progress.completed}/{progress.total} tasks</span>
          <span>{progress.progress}%</span>
        </div>
      </Link>
    );
  });
}

function StatCard({ icon: Icon, label, value, hint, tone }: { icon: React.ComponentType<{ className?: string }>; label: string; value: number; hint: string; tone: "default" | "success" | "destructive" }) {
  const toneClass = tone === "success" ? "bg-success/15 text-success" : tone === "destructive" ? "bg-destructive/15 text-destructive" : "bg-accent text-accent-foreground";
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div className={`h-10 w-10 rounded-lg grid place-items-center ${toneClass}`}><Icon className="h-5 w-5" /></div>
        </div>
        <div className="mt-4 text-3xl font-semibold tabular-nums">{value}</div>
        <div className="mt-1 text-sm text-muted-foreground">{label}</div>
        <div className="mt-2 text-xs text-muted-foreground">{hint}</div>
      </CardContent>
    </Card>
  );
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
function formatDateShort(d: string) {
  const date = new Date(d);
  return `${date.toLocaleString("en-US", { month: "short" })} ${date.getDate()}`;
}
