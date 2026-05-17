import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PageHeader, EmptyState } from "@/components/app-layout";
import { InviteMemberDialog } from "@/components/dialogs";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ProjectsApi, TasksApi, UsersApi } from "@/lib/api";
import type { Role } from "@/lib/api-types";
import { Search, Users, Trash2 } from "lucide-react";
import { useApp } from "@/lib/app-context";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { getInitials, roleLabel, roleTitle } from "@/lib/formatters";

export const Route = createFileRoute("/app/team")({ component: TeamPage });

function TeamPage() {
  const { role } = useApp();
  const queryClient = useQueryClient();
  const [q, setQ] = useState("");
  const { data: usersData, isLoading, isError } = useQuery({
    queryKey: ["users"],
    queryFn: () => UsersApi.list({ page: 1, limit: 100 }),
    retry: false,
  });
  const { data: projectsData } = useQuery({ queryKey: ["projects", "team"], queryFn: () => ProjectsApi.list({ page: 1, limit: 200, sortBy: "dueDate", sortOrder: "asc" }) });
  const { data: tasksData } = useQuery({ queryKey: ["tasks", "team"], queryFn: () => TasksApi.list({ page: 1, limit: 200, sortBy: "createdAt", sortOrder: "desc" }) });

  const updateRole = useMutation({
    mutationFn: ({ userId, nextRole }: { userId: string; nextRole: Role }) => UsersApi.updateRole(userId, nextRole),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Role updated");
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Failed to update role"),
  });

  const filtered = useMemo(() => {
    const users = usersData?.items ?? [];
    return users.filter((u) => u.name.toLowerCase().includes(q.toLowerCase()) || u.email.toLowerCase().includes(q.toLowerCase()));
  }, [usersData?.items, q]);

  const counts = useMemo(() => {
    const projectMap: Record<string, number> = {};
    (projectsData?.items ?? []).forEach((project) => {
      project.members.forEach((member) => {
        projectMap[member.userId] = (projectMap[member.userId] ?? 0) + 1;
      });
    });

    const taskMap: Record<string, number> = {};
    (tasksData?.items ?? []).forEach((task) => {
      if (task.assignedToId) {
        taskMap[task.assignedToId] = (taskMap[task.assignedToId] ?? 0) + 1;
      }
    });

    return { projectMap, taskMap };
  }, [projectsData?.items, tasksData?.items]);

  return (
    <>
      <PageHeader
        title="Team"
        description="Everyone in your workspace."
        action={role === "ADMIN" ? <InviteMemberDialog /> : undefined}
      />

      <div className="relative max-w-sm mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search by name or email" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9 bg-card" />
      </div>

      {isLoading ? (
        <div className="text-sm text-muted-foreground">Loading team…</div>
      ) : isError ? (
        <EmptyState icon={Users} title="Team access restricted" description="Only admins can view the full member list." />
      ) : filtered.length === 0 ? (
        <EmptyState icon={Users} title="No matching members" description="Try a different search term." />
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="hidden md:grid grid-cols-[2fr_1fr_120px_100px_100px_60px] gap-4 px-6 py-3 border-b border-border text-xs font-medium text-muted-foreground uppercase tracking-wider">
              <div>Member</div><div>Title</div><div>Role</div><div>Projects</div><div>Tasks</div><div></div>
            </div>
            <div className="divide-y divide-border">
              {filtered.map(u => (
                <div key={u.id} className="grid grid-cols-1 md:grid-cols-[2fr_1fr_120px_100px_100px_60px] gap-3 md:gap-4 px-6 py-4 items-center">
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar className="h-10 w-10"><AvatarFallback className="bg-accent text-accent-foreground text-xs">{getInitials(u.name)}</AvatarFallback></Avatar>
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">{u.name}</div>
                      <div className="text-xs text-muted-foreground truncate">{u.email}</div>
                    </div>
                  </div>
                  <div className="hidden md:block text-sm text-muted-foreground truncate">{roleTitle(u.role)}</div>
                  <div>
                    {role === "ADMIN" ? (
                      <Select defaultValue={u.role} onValueChange={(v) => updateRole.mutate({ userId: u.id, nextRole: v as Role })}>
                        <SelectTrigger className="h-8 w-[110px]"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ADMIN">Admin</SelectItem>
                          <SelectItem value="MEMBER">Member</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <span className={cn("text-xs px-2 py-0.5 rounded-full", u.role === "ADMIN" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground")}>{roleLabel(u.role)}</span>
                    )}
                  </div>
                  <div className="hidden md:block text-sm tabular-nums">{counts.projectMap[u.id] ?? 0}</div>
                  <div className="hidden md:block text-sm tabular-nums">{counts.taskMap[u.id] ?? 0}</div>
                  <div>
                    {role === "ADMIN" && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remove {u.name}?</AlertDialogTitle>
                            <AlertDialogDescription>They'll lose access to this workspace immediately. Their assigned tasks will become unassigned.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => toast.info("Removal not yet implemented") } className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Remove member</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
