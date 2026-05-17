import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/app-layout";
import { NewTaskDialog } from "@/components/dialogs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ProjectStatusBadge, StatusBadge, PriorityBadge } from "@/components/status-badge";
import { AvatarStack } from "@/components/avatar-stack";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ProjectsApi, TasksApi, ActivityApi } from "@/lib/api";
import { ArrowLeft, Calendar, Pencil, Trash2, Users } from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useApp } from "@/lib/app-context";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { getInitials, isOverdue, projectColor, projectProgress } from "@/lib/formatters";

export const Route = createFileRoute("/app/projects/$projectId")({
  component: ProjectDetailPage,
  notFoundComponent: () => <div className="p-8 text-sm text-muted-foreground">Project not found.</div>,
});

function ProjectDetailPage() {
  const { projectId } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { role } = useApp();
  const [tab, setTab] = useState("overview");

  const { data: project, isLoading } = useQuery({ queryKey: ["project", projectId], queryFn: () => ProjectsApi.getById(projectId) });
  const { data: taskData } = useQuery({ queryKey: ["tasks", projectId], queryFn: () => TasksApi.list({ projectId, page: 1, limit: 100 }) });
  const { data: activityData } = useQuery({ queryKey: ["activity", projectId], queryFn: () => ActivityApi.list({ page: 1, limit: 100 }) });

  const projectTasks = taskData?.items ?? [];
  const projectMembers = project?.members.map((member) => member.user) ?? [];
  const overdueCount = projectTasks.filter((t) => isOverdue(t)).length;
  const activity = useMemo(() => (activityData?.items ?? []).filter((item) => item.entityId === projectId), [activityData?.items, projectId]);

  const removeProject = useMutation({
    mutationFn: () => ProjectsApi.remove(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Project deleted");
      navigate({ to: "/app/projects" });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Failed to delete project"),
  });

  if (isLoading) return <div className="p-8 text-sm text-muted-foreground">Loading project…</div>;
  if (!project) return <div className="p-8">Project not found.</div>;

  const progress = projectProgress({ ...project, tasks: projectTasks });

  return (
    <>
      <Link to="/app/projects" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-4 w-4" /> Back to projects
      </Link>

      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 mb-6">
        <div className="flex gap-4 min-w-0">
          <div className="h-14 w-14 rounded-xl shrink-0" style={{ backgroundColor: projectColor(project.id) }} />
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">{project.name}</h1>
              <ProjectStatusBadge status={project.status} />
            </div>
            <p className="mt-2 text-sm text-muted-foreground max-w-2xl">{project.description}</p>
            <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> {fmt(project.startDate)} → {fmt(project.dueDate)}</span>
              <span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /> {projectMembers.length} members</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {role === "ADMIN" && <NewTaskDialog projectId={project.id} />}
          {role === "ADMIN" && (
            <>
              <Button variant="outline" onClick={() => toast.info("Edit panel coming soon")}><Pencil className="h-4 w-4 mr-1.5" /> Edit</Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4 mr-1.5" /> Delete</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete this project?</AlertDialogTitle>
                    <AlertDialogDescription>This will permanently delete <b>{project.name}</b> and all of its tasks. This action can't be undone.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => removeProject.mutate()} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete project</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MiniStat label="Progress" value={`${progress.progress}%`} />
        <MiniStat label="Tasks" value={`${progress.completed}/${progress.total}`} />
        <MiniStat label="Members" value={String(projectMembers.length)} />
        <MiniStat label="Overdue" value={String(overdueCount)} tone={overdueCount > 0 ? "destructive" : "default"} />
      </div>

      <Progress value={progress.progress} className="h-1.5 mb-8" />

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tasks">Tasks ({projectTasks.length})</TabsTrigger>
          <TabsTrigger value="members">Members ({projectMembers.length})</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6 grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">Recent tasks</h3>
              <div className="divide-y divide-border -mx-6">
                {projectTasks.slice(0, 6).map(t => (
                  <div key={t.id} className="px-6 py-3 flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{t.title}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">Assigned to {t.assignedTo?.name ?? "Unassigned"}</div>
                    </div>
                    <PriorityBadge priority={t.priority} />
                    <StatusBadge status={t.status} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">Team</h3>
              <div className="space-y-3">
                {projectMembers.map(u => (
                  <div key={u.id} className="flex items-center gap-3">
                    <Avatar className="h-9 w-9"><AvatarFallback className="bg-accent text-accent-foreground text-xs">{getInitials(u.name)}</AvatarFallback></Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium truncate">{u.name}</div>
                      <div className="text-xs text-muted-foreground truncate">{u.email}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks" className="mt-6">
          <Card>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {projectTasks.map(t => (
                  <div key={t.id} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-3 hover:bg-muted/40">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium">{t.title}</div>
                      <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{t.description}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-7 w-7"><AvatarFallback className="text-[10px] bg-accent text-accent-foreground">{getInitials(t.assignedTo?.name ?? "?")}</AvatarFallback></Avatar>
                      <PriorityBadge priority={t.priority} />
                      <StatusBadge status={t.status} />
                      <span className={cn("text-xs tabular-nums w-16 text-right", isOverdue(t) ? "text-destructive font-medium" : "text-muted-foreground")}>{fmt(t.dueDate)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="members" className="mt-6">
          <Card>
            <CardContent className="p-0 divide-y divide-border">
              {projectMembers.map(u => (
                <div key={u.id} className="px-6 py-4 flex items-center gap-3">
                  <Avatar className="h-10 w-10"><AvatarFallback className="bg-accent text-accent-foreground text-xs">{getInitials(u.name)}</AvatarFallback></Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">{u.name}</div>
                    <div className="text-xs text-muted-foreground">{u.email}</div>
                  </div>
                  <span className={cn("text-xs px-2 py-0.5 rounded-full", u.role === "ADMIN" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground")}>{u.role}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="mt-6">
          <Card>
            <CardContent className="p-6 space-y-5">
              {activity.map(a => (
                <div key={a.id} className="flex gap-3">
                  <Avatar className="h-8 w-8 mt-0.5"><AvatarFallback className="text-[10px] bg-accent text-accent-foreground">{getInitials(a.user?.name ?? "?")}</AvatarFallback></Avatar>
                  <div>
                    <div className="text-sm leading-snug"><span className="font-medium">{a.user?.name ?? "Someone"}</span> <span className="text-muted-foreground">{a.action}</span> <span className="font-medium">{a.entityType}</span></div>
                    <div className="text-xs text-muted-foreground mt-0.5">{new Date(a.createdAt).toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-8">
        <h3 className="text-sm font-medium text-muted-foreground mb-3">Other projects</h3>
        <div className="flex gap-3 overflow-x-auto pb-2">
          <OtherProjects currentId={projectId} />
        </div>
      </div>
    </>
  );
}

function OtherProjects({ currentId }: { currentId: string }) {
  const { data } = useQuery({ queryKey: ["projects", "other"], queryFn: () => ProjectsApi.list({ page: 1, limit: 4, sortBy: "dueDate", sortOrder: "asc" }) });
  const projects = (data?.items ?? []).filter((project) => project.id !== currentId).slice(0, 4);
  return projects.map(p => {
    const progress = projectProgress(p);
    return (
      <Link key={p.id} to="/app/projects/$projectId" params={{ projectId: p.id }} className="min-w-[220px] rounded-xl border border-border bg-card p-3 hover:border-primary/40">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-md" style={{ backgroundColor: projectColor(p.id) }} />
          <div className="text-sm font-medium truncate">{p.name}</div>
        </div>
        <Progress value={progress.progress} className="h-1 mt-3" />
        <div className="mt-2 flex justify-between"><AvatarStack users={p.members.map((m) => m.user)} /><span className="text-xs text-muted-foreground">{progress.progress}%</span></div>
      </Link>
    );
  });
}

function MiniStat({ label, value, tone = "default" }: { label: string; value: string; tone?: "default" | "destructive" }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className={cn("mt-1 text-2xl font-semibold tabular-nums", tone === "destructive" && "text-destructive")}>{value}</div>
      </CardContent>
    </Card>
  );
}

function fmt(d: string) { return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }); }
