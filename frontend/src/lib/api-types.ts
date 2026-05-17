export type Role = "ADMIN" | "MEMBER";
export type ProjectStatus = "PLANNING" | "ACTIVE" | "ON_HOLD" | "COMPLETED";
export type TaskStatus = "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
};

export type ProjectMember = {
  id: string;
  projectId: string;
  userId: string;
  assignedRole: "OWNER" | "MEMBER";
  createdAt: string;
  user: User;
};

export type Task = {
  id: string;
  title: string;
  description?: string | null;
  projectId: string;
  assignedToId: string | null;
  createdById: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
  project?: { id: string; name: string; ownerId: string };
  assignedTo?: User | null;
  createdBy?: User;
};

export type Project = {
  id: string;
  name: string;
  description?: string | null;
  ownerId: string;
  status: ProjectStatus;
  startDate: string;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
  members: ProjectMember[];
  tasks: Task[];
};

export type ActivityLog = {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
  user?: User;
};

export type PaginatedResponse<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type DashboardSummary = {
  totalProjects: number;
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  dueSoonTasks: number;
  tasksByStatus: Array<{ status: TaskStatus; _count: { _all: number } }>;
  recentActivity: ActivityLog[];
  myAssignedTasks: Task[];
};
