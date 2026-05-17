import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { ProjectsApi, TasksApi, UsersApi } from "@/lib/api";
import type { ProjectStatus, Role, TaskPriority, TaskStatus } from "@/lib/api-types";
import { priorityLabel, projectStatusLabel, taskStatusLabel } from "@/lib/formatters";
import { useApp } from "@/lib/app-context";

export function NewProjectDialog({ trigger }: { trigger?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<ProjectStatus>("PLANNING");
  const queryClient = useQueryClient();
  const createProject = useMutation({
    mutationFn: ProjectsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Project created");
      setOpen(false);
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Failed to create project"),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger || <Button><Plus className="h-4 w-4 mr-1.5" /> New project</Button>}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create project</DialogTitle>
          <DialogDescription>Group work, assign owners, and track progress.</DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const form = new FormData(e.currentTarget);
            createProject.mutate({
              name: String(form.get("name")),
              description: String(form.get("description") || "").trim() || undefined,
              status,
              startDate: String(form.get("startDate")),
              dueDate: String(form.get("dueDate")),
            });
          }}
          className="space-y-4"
        >
          <div className="space-y-1.5"><Label>Project name</Label><Input name="name" placeholder="e.g. Q3 Launch" required /></div>
          <div className="space-y-1.5"><Label>Description</Label><Textarea name="description" rows={3} placeholder="What's this project about?" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5"><Label>Start date</Label><Input name="startDate" type="date" required /></div>
            <div className="space-y-1.5"><Label>Due date</Label><Input name="dueDate" type="date" required /></div>
          </div>
          <div className="space-y-1.5">
            <Label>Status</Label>
            <Select value={status} onValueChange={(value) => setStatus(value as ProjectStatus)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(projectStatusLabel).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={createProject.isPending}>Create project</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function NewTaskDialog({ trigger, projectId }: { trigger?: React.ReactNode; projectId?: string }) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const { role } = useApp();
  const { data: projectData } = useQuery({ queryKey: ["projects", "options"], queryFn: () => ProjectsApi.list({ page: 1, limit: 50 }) });
  const { data: userData } = useQuery({ queryKey: ["users", "options"], queryFn: () => UsersApi.list({ page: 1, limit: 50 }) });
  const projects = projectData?.items ?? [];
  const users = userData?.items ?? [];
  const [selectedProject, setSelectedProject] = useState<string | undefined>(projectId);
  const [assigneeId, setAssigneeId] = useState<string | undefined>(users[0]?.id);
  const [status, setStatus] = useState<TaskStatus>("TODO");
  const [priority, setPriority] = useState<TaskPriority>("MEDIUM");
  const createTask = useMutation({
    mutationFn: TasksApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Task created");
      setOpen(false);
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Failed to create task"),
  });

  const selectedProjectData = useMemo(
    () => projects.find((project) => project.id === selectedProject) ?? projects.find((project) => project.id === projectId),
    [projects, selectedProject, projectId],
  );
  const memberUsers = selectedProjectData?.members.map((member) => member.user) ?? [];
  const assigneeOptions = memberUsers.length ? memberUsers : users;

  useEffect(() => {
    if (!selectedProject && projects.length) {
      setSelectedProject(projectId ?? projects[0]?.id);
    }
  }, [projects, projectId, selectedProject]);

  useEffect(() => {
    if (!selectedProjectData) return;
    if (assigneeId && memberUsers.some((user) => user.id === assigneeId)) return;
    setAssigneeId(memberUsers[0]?.id);
  }, [assigneeId, memberUsers, selectedProjectData]);

  const isDisabled = role !== "ADMIN";
  const isReady = Boolean(selectedProject && assigneeId);
  // console.log("project ", projects, "users ", users, "selectedProjectData ", selectedProjectData, "assigneeOptions ", assigneeOptions, "isReady ", isReady);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger || <Button><Plus className="h-4 w-4 mr-1.5" /> New task</Button>}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create task</DialogTitle>
          <DialogDescription>Assign work to a teammate and set a deadline.</DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (isDisabled) return;
            const form = new FormData(e.currentTarget);
            createTask.mutate({
              title: String(form.get("title")),
              description: String(form.get("description") || "").trim() || undefined,
              projectId: selectedProject ?? "",
              assignedToId: assigneeId ?? "",
              status,
              priority,
              dueDate: String(form.get("dueDate")),
            });
          }}
          className="space-y-4"
        >
          <div className="space-y-1.5"><Label>Title</Label><Input name="title" placeholder="What needs to be done?" required /></div>
          <div className="space-y-1.5"><Label>Description</Label><Textarea name="description" rows={3} placeholder="Add details, links, acceptance criteria…" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Project</Label>
              <Select value={selectedProject} onValueChange={(value) => setSelectedProject(value)}>
                <SelectTrigger><SelectValue placeholder="Select project" /></SelectTrigger>
                <SelectContent>{projects.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Assignee</Label>
              <Select value={assigneeId} onValueChange={(value) => setAssigneeId(value)} disabled={!assigneeOptions.length}>
                <SelectTrigger><SelectValue placeholder={assigneeOptions.length ? "Select assignee" : "No members"} /></SelectTrigger>
                <SelectContent>{assigneeOptions.map(u => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={status} onValueChange={(value) => setStatus(value as TaskStatus)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(taskStatusLabel).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={(value) => setPriority(value as TaskPriority)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(priorityLabel).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5 col-span-2"><Label>Due date</Label><Input name="dueDate" type="date" required /></div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={createTask.isPending || isDisabled || !isReady}>Create task</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function InviteMemberDialog({ trigger }: { trigger?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState<Role>("MEMBER");
  const queryClient = useQueryClient();
  const inviteMember = useMutation({
    mutationFn: UsersApi.invite,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Invitation sent");
      setOpen(false);
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Failed to send invite"),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger || <Button variant="outline"><Plus className="h-4 w-4 mr-1.5" /> Invite member</Button>}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite a teammate</DialogTitle>
          <DialogDescription>They'll get an email to join your workspace.</DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const form = new FormData(e.currentTarget);
            inviteMember.mutate({
              name: String(form.get("name")),
              email: String(form.get("email")),
              role,
              temporaryPassword: String(form.get("temporaryPassword")),
            });
          }}
          className="space-y-4"
        >
          <div className="space-y-1.5"><Label>Full name</Label><Input name="name" placeholder="Teammate name" required /></div>
          <div className="space-y-1.5"><Label>Email address</Label><Input name="email" type="email" placeholder="teammate@company.com" required /></div>
          <div className="space-y-1.5">
            <Label>Role</Label>
            <Select value={role} onValueChange={(value) => setRole(value as Role)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ADMIN">Admin — full access</SelectItem>
                <SelectItem value="MEMBER">Member — focused on assigned work</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5"><Label>Temporary password</Label><Input name="temporaryPassword" type="password" placeholder="Temp password" required /></div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={inviteMember.isPending}>Send invite</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
