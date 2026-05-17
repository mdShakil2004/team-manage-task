import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/app-layout";
import { NewProjectDialog } from "@/components/dialogs";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { ProjectStatusBadge } from "@/components/status-badge";
import { AvatarStack } from "@/components/avatar-stack";
import { Folder, Search, Calendar } from "lucide-react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useApp } from "@/lib/app-context";
import { EmptyState } from "@/components/app-layout";
import { ProjectsApi } from "@/lib/api";
import type { ProjectStatus } from "@/lib/api-types";
import { projectColor, projectProgress, projectStatusLabel } from "@/lib/formatters";

export const Route = createFileRoute("/app/projects")({ component: ProjectsPage });

function ProjectsPage() {
  const { role } = useApp();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<ProjectStatus | "all">("all");
  const [sort, setSort] = useState<"due" | "progress" | "name">("due");

  const { data, isLoading } = useQuery({
    queryKey: ["projects", { q, status }],
    queryFn: () =>
      ProjectsApi.list({
        search: q || undefined,
        status: status === "all" ? undefined : status,
        sortBy: "dueDate",
        sortOrder: "asc",
        page: 1,
        limit: 50,
      }),
  });

  const filtered = useMemo(() => {
    const items = data?.items ?? [];
    const enriched = items.map((project) => {
      const progress = projectProgress(project);
      return {
        ...project,
        progress: progress.progress,
        completedTasks: progress.completed,
        taskCount: progress.total,
        members: project.members.map((member) => member.user),
        color: projectColor(project.id),
      };
    });

    const sorted = [...enriched].sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name);
      if (sort === "progress") return b.progress - a.progress;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });

    return sorted;
  }, [data?.items, sort]);

  return (
    <>
      <PageHeader
        title="Projects"
        description="All workstreams across your team."
        action={role === "ADMIN" ? <NewProjectDialog /> : undefined}
      />

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search projects" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9 bg-card" />
        </div>
        <Select value={status} onValueChange={(v) => setStatus(v as ProjectStatus | "all")}>
          <SelectTrigger className="sm:w-[180px] bg-card"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {Object.entries(projectStatusLabel).map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={(v) => setSort(v as typeof sort)}>
          <SelectTrigger className="sm:w-[180px] bg-card"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="due">Sort: Due date</SelectItem>
            <SelectItem value="progress">Sort: Progress</SelectItem>
            <SelectItem value="name">Sort: Name</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="text-sm text-muted-foreground">Loading projects…</div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Folder}
          title={q ? "No matching projects" : "No projects yet"}
          description={q ? "Try a different search or clear filters to see everything." : "Create your first project to start tracking work."}
          action={role === "ADMIN" && !q ? <NewProjectDialog /> : undefined}
        />
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(p => (
            <Link key={p.id} to="/app/projects/$projectId" params={{ projectId: p.id }} className="group">
              <Card className="h-full hover:border-primary/40 hover:shadow-[var(--shadow-elevated)] transition">
                <CardContent className="p-5 flex flex-col h-full">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-10 w-10 rounded-lg shrink-0" style={{ backgroundColor: p.color, opacity: 0.95 }} />
                      <div className="min-w-0">
                        <div className="font-semibold truncate group-hover:text-primary transition">{p.name}</div>
                        <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1"><Calendar className="h-3 w-3" /> Due {new Date(p.dueDate).toLocaleDateString("en-US",{month:"short",day:"numeric"})}</div>
                      </div>
                    </div>
                    <ProjectStatusBadge status={p.status} />
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground line-clamp-2">{p.description}</p>
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                      <span>Progress</span>
                      <span className="font-medium text-foreground tabular-nums">{p.progress}%</span>
                    </div>
                    <Progress value={p.progress} className="h-1.5" />
                  </div>
                  <div className="mt-5 flex items-center justify-between">
                    <AvatarStack users={p.members} />
                    <div className="text-xs text-muted-foreground tabular-nums">{p.completedTasks}/{p.taskCount} tasks · {p.members.length} {p.members.length === 1 ? "member" : "members"}</div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
