import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PageHeader, EmptyState } from "@/components/app-layout";
import { NewTaskDialog } from "@/components/dialogs";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { StatusBadge, PriorityBadge } from "@/components/status-badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@/components/ui/sheet";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { TasksApi, ProjectsApi, UsersApi } from "@/lib/api";
import type { Task, TaskPriority, TaskStatus } from "@/lib/api-types";
import { getInitials, isOverdue, priorityLabel, projectColor, taskStatusLabel } from "@/lib/formatters";
import { Search, CheckSquare, ListTodo, LayoutGrid, ChevronDown, MoreHorizontal } from "lucide-react";
import { useApp } from "@/lib/app-context";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/app/tasks")({ component: TasksPage });

const STATUSES = Object.keys(taskStatusLabel) as TaskStatus[];

function TasksPage() {
  const { role, user } = useApp();
  const queryClient = useQueryClient();
  const [view, setView] = useState<"list" | "kanban">("list");
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<TaskStatus | "all">("all");
  const [priority, setPriority] = useState<TaskPriority | "all">("all");
  const [assignee, setAssignee] = useState<string>("all");
  const [project, setProject] = useState<string>("all");
  const [selected, setSelected] = useState<Task | null>(null);

  const { data: projectData } = useQuery({ queryKey: ["projects", "filters"], queryFn: () => ProjectsApi.list({ page: 1, limit: 50, sortBy: "dueDate", sortOrder: "asc" }) });
  const { data: userData } = useQuery({ queryKey: ["users", "filters"], queryFn: () => UsersApi.list({ page: 1, limit: 50 }) });

  const { data: taskData, isLoading } = useQuery({
    queryKey: ["tasks", { q, status, priority, assignee, project, role }],
    queryFn: () =>
      TasksApi.list({
        search: q || undefined,
        status: status === "all" ? undefined : status,
        priority: priority === "all" ? undefined : priority,
        assigneeId: role === "MEMBER" ? user?.id : assignee === "all" ? undefined : assignee,
        projectId: project === "all" ? undefined : project,
        sortBy: "createdAt",
        sortOrder: "desc",
        page: 1,
        limit: 100,
      }),
    enabled: Boolean(user),
  });

  const tasks = taskData?.items ?? [];
  const base = useMemo(() => tasks, [tasks]);

  const updateStatus = useMutation({
    mutationFn: ({ id, status: nextStatus }: { id: string; status: TaskStatus }) => TasksApi.updateStatus(id, nextStatus),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Task status updated");
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Failed to update status"),
  });

  return (
    <>
      <PageHeader
        title="Tasks"
        description={role === "ADMIN" ? "Every task across the workspace." : "Tasks assigned to you."}
        action={role === "ADMIN" ? <NewTaskDialog /> : undefined}
      />

      <div className="flex flex-col gap-3 mb-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search tasks" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9 bg-card" />
          </div>
          <Tabs value={view} onValueChange={(v) => setView(v as "list" | "kanban")}
          >
            <TabsList>
              <TabsTrigger value="list"><ListTodo className="h-4 w-4 mr-1.5" /> List</TabsTrigger>
              <TabsTrigger value="kanban"><LayoutGrid className="h-4 w-4 mr-1.5" /> Kanban</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <div className="flex flex-wrap gap-2">
          <FilterSelect value={status} onChange={(v) => setStatus(v as TaskStatus | "all")} placeholder="Status" options={[{ value: "all", label: "All statuses" }, ...STATUSES.map((s) => ({ value: s, label: taskStatusLabel[s] }))]} />
          <FilterSelect value={priority} onChange={(v) => setPriority(v as TaskPriority | "all")} placeholder="Priority" options={[{ value: "all", label: "All priorities" }, ...Object.entries(priorityLabel).map(([value, label]) => ({ value, label }))]} />
          <FilterSelect value={assignee} onChange={setAssignee} placeholder="Assignee" options={[{ value: "all", label: "All assignees" }, ...(userData?.items ?? []).map((u) => ({ value: u.id, label: u.name }))]} />
          <FilterSelect value={project} onChange={setProject} placeholder="Project" options={[{ value: "all", label: "All projects" }, ...(projectData?.items ?? []).map((p) => ({ value: p.id, label: p.name }))]} />
        </div>
      </div>

      {isLoading ? (
        <div className="text-sm text-muted-foreground">Loading tasks…</div>
      ) : base.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title={role === "MEMBER" ? "No tasks assigned to you" : "No tasks match your filters"}
          description={role === "MEMBER" ? "When something is assigned to you it'll show up here." : "Try clearing some filters or create a new task."}
          action={role === "ADMIN" ? <NewTaskDialog /> : undefined}
        />
      ) : view === "list" ? (
        <Card>
          <CardContent className="p-0">
            <div className="hidden md:grid grid-cols-[1fr_140px_120px_120px_120px_40px] gap-4 px-6 py-3 border-b border-border text-xs font-medium text-muted-foreground uppercase tracking-wider">
              <div>Task</div><div>Project</div><div>Assignee</div><div>Priority</div><div>Status</div><div></div>
            </div>
            <div className="divide-y divide-border">
              {base.map(t => {
                const overdue = isOverdue(t);
                return (
                  <button key={t.id} onClick={() => setSelected(t)} className="w-full text-left grid grid-cols-1 md:grid-cols-[1fr_140px_120px_120px_120px_40px] gap-3 md:gap-4 items-center px-6 py-4 hover:bg-muted/40 transition">
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">{t.title}</div>
                      <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2">
                        <span className="md:hidden">{t.project?.name} · </span>
                        <span className={cn(overdue && "text-destructive font-medium")}>Due {fmt(t.dueDate)}</span>
                      </div>
                    </div>
                    <div className="hidden md:flex items-center gap-2 min-w-0">
                      <div className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: t.project?.id ? projectColor(t.project.id) : "var(--muted-foreground)" }} />
                      <span className="text-xs text-muted-foreground truncate">{t.project?.name}</span>
                    </div>
                    <div className="hidden md:flex items-center gap-2 min-w-0">
                      <Avatar className="h-6 w-6"><AvatarFallback className="text-[9px] bg-accent text-accent-foreground">{getInitials(t.assignedTo?.name ?? "?")}</AvatarFallback></Avatar>
                      <span className="text-xs truncate">{t.assignedTo?.name?.split(" ")[0] ?? "Unassigned"}</span>
                    </div>
                    <div className="hidden md:block"><PriorityBadge priority={t.priority} /></div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={t.status} />
                    </div>
                    <div className="hidden md:block" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {STATUSES.map((s) => (
                            <DropdownMenuItem key={s} onClick={() => updateStatus.mutate({ id: t.id, status: s })}>Move to {taskStatusLabel[s]}</DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="px-6 py-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
              <span>Showing {base.length} of {taskData?.total ?? base.length} tasks</span>
              <div className="flex gap-1">
                <Button variant="outline" size="sm" disabled>Previous</Button>
                <Button variant="outline" size="sm">Next</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {STATUSES.map(s => {
            const col = base.filter(t => t.status === s);
            return (
              <div key={s} className="rounded-xl bg-muted/40 p-3 min-h-[200px]">
                <div className="flex items-center justify-between mb-3 px-1">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={s} />
                    <span className="text-xs text-muted-foreground tabular-nums">{col.length}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  {col.map(t => {
                    const overdue = isOverdue(t);
                    return (
                      <button key={t.id} onClick={() => setSelected(t)} className="w-full text-left rounded-lg bg-card border border-border p-3 hover:border-primary/40 hover:shadow-[var(--shadow-soft)] transition">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: "var(--muted-foreground)" }} />
                          <span className="text-[11px] text-muted-foreground truncate">{t.project?.name}</span>
                        </div>
                        <div className="text-sm font-medium leading-snug">{t.title}</div>
                        <div className="mt-3 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <PriorityBadge priority={t.priority} className="text-[10px] py-0" />
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className={cn("text-[10px] tabular-nums", overdue ? "text-destructive font-medium" : "text-muted-foreground")}>{fmt(t.dueDate)}</span>
                            <Avatar className="h-6 w-6"><AvatarFallback className="text-[9px] bg-accent text-accent-foreground">{getInitials(t.assignedTo?.name ?? "?")}</AvatarFallback></Avatar>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <TaskDrawer task={selected} onClose={() => setSelected(null)} />
    </>
  );
}

function FilterSelect({ value, onChange, placeholder, options }: { value: string; onChange: (v: string) => void; placeholder: string; options: { value: string; label: string }[] }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="bg-card w-auto min-w-[140px] h-9 gap-1.5"><SelectValue placeholder={placeholder} /><ChevronDown className="h-3.5 w-3.5 opacity-50" /></SelectTrigger>
      <SelectContent>{options.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
    </Select>
  );
}

function TaskDrawer({ task, onClose }: { task: Task | null; onClose: () => void }) {
  const { role, user } = useApp();
  const queryClient = useQueryClient();
  if (!task) return null;
  const canEditAll = role === "ADMIN";
  const isMine = task.assignedToId === user?.id;
  const updateStatus = useMutation({
    mutationFn: (status: TaskStatus) => TasksApi.updateStatus(task.id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Status updated");
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Failed to update"),
  });
  const updatePriority = useMutation({
    mutationFn: (priority: TaskPriority) => TasksApi.update(task.id, { priority }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks"] }),
  });
  const assignTask = useMutation({
    mutationFn: (assignedToId: string) => TasksApi.assign(task.id, assignedToId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks"] }),
  });
  const { data: userData } = useQuery({ queryKey: ["users", "drawer"], queryFn: () => UsersApi.list({ page: 1, limit: 50 }) });
  const users = userData?.items ?? [];

  return (
    <Sheet open onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="sm:max-w-lg w-full overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {task.project?.name}
          </div>
          <SheetTitle className="text-xl">{task.title}</SheetTitle>
          <SheetDescription className="text-sm">{task.description}</SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-5">
          <Field label="Status">
            {(canEditAll || isMine) ? (
              <Select defaultValue={task.status} onValueChange={(v) => updateStatus.mutate(v as TaskStatus)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{STATUSES.map(s => <SelectItem key={s} value={s}>{taskStatusLabel[s]}</SelectItem>)}</SelectContent>
              </Select>
            ) : <StatusBadge status={task.status} />}
          </Field>
          <Field label="Priority">
            {canEditAll ? (
              <Select defaultValue={task.priority} onValueChange={(v) => updatePriority.mutate(v as TaskPriority)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{Object.entries(priorityLabel).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent>
              </Select>
            ) : <PriorityBadge priority={task.priority} />}
          </Field>
          <Field label="Assignee">
            {canEditAll ? (
              <Select defaultValue={task.assignedToId ?? undefined} onValueChange={(v) => assignTask.mutate(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{users.map(u => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}</SelectContent>
              </Select>
            ) : (
              <div className="flex items-center gap-2">
                <Avatar className="h-7 w-7"><AvatarFallback className="text-[10px] bg-accent text-accent-foreground">{getInitials(task.assignedTo?.name ?? "?")}</AvatarFallback></Avatar>
                <span className="text-sm">{task.assignedTo?.name ?? "Unassigned"}</span>
              </div>
            )}
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Due date"><div className={cn("text-sm", isOverdue(task) && "text-destructive font-medium")}>{fmt(task.dueDate)}</div></Field>
            <Field label="Created"><div className="text-sm text-muted-foreground">{fmt(task.createdAt)} by {task.createdBy?.name?.split(" ")[0] ?? ""}</div></Field>
          </div>
          {!canEditAll && !isMine && (
            <div className="rounded-md border border-warning/30 bg-warning/10 px-3 py-2 text-xs text-warning-foreground">You can view this task but only the assignee or an admin can update it.</div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">{label}</div>
      {children}
    </div>
  );
}

function fmt(d: string) { return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" }); }
