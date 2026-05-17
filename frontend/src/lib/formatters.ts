import type { Project, ProjectStatus, Task, TaskPriority, TaskStatus, User } from "./api-types";

export const getInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "?";

export const roleLabel = (role: User["role"]) => (role === "ADMIN" ? "Admin" : "Member");
export const roleTitle = (role: User["role"]) => (role === "ADMIN" ? "Workspace admin" : "Team member");

export const taskStatusLabel: Record<TaskStatus, string> = {
  TODO: "Todo",
  IN_PROGRESS: "In Progress",
  REVIEW: "Review",
  DONE: "Done",
};

export const projectStatusLabel: Record<ProjectStatus, string> = {
  PLANNING: "Planning",
  ACTIVE: "Active",
  ON_HOLD: "On Hold",
  COMPLETED: "Completed",
};

export const priorityLabel: Record<TaskPriority, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  URGENT: "Urgent",
};

export const isOverdue = (task: Pick<Task, "dueDate" | "status">) => {
  if (task.status === "DONE") return false;
  return new Date(task.dueDate) < new Date();
};

export const projectColor = (projectId: string) => {
  const colors = ["oklch(0.52 0.17 258)", "oklch(0.65 0.16 155)", "oklch(0.62 0.18 300)", "oklch(0.76 0.16 70)", "oklch(0.58 0.22 27)", "oklch(0.62 0.15 230)"];
  const index = Math.abs(
    projectId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0),
  );
  return colors[index % colors.length];
};

export const projectProgress = (project: Project) => {
  const total = project.tasks.length || 0;
  const completed = project.tasks.filter((task) => task.status === "DONE").length;
  const progress = total ? Math.round((completed / total) * 100) : 0;
  return { total, completed, progress };
};
