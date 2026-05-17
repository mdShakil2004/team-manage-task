import type {
  ActivityLog,
  DashboardSummary,
  PaginatedResponse,
  Project,
  ProjectStatus,
  Role,
  Task,
  TaskPriority,
  TaskStatus,
  User,
} from "./api-types";
import { getAuthToken } from "./auth-storage";

const API_BASE = import.meta.env.VITE_API_URL ?? "/api";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
    public readonly details?: unknown,
  ) {
    super(message);
  }
}

const buildQuery = (params: Record<string, string | number | boolean | undefined>) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === "") return;
    query.set(key, String(value));
  });
  const str = query.toString();
  return str ? `?${str}` : "";
};

const request = async <T>(path: string, options: RequestInit = {}): Promise<T> => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
  });

  const text = await response.text();
  const payload = text ? (JSON.parse(text) as { success?: boolean; data?: T; message?: string; errorCode?: string; details?: unknown }) : null;

  if (!response.ok || payload?.success === false) {
    throw new ApiError(payload?.message ?? "Request failed", response.status, payload?.errorCode, payload?.details);
  }

  return (payload?.data ?? payload) as T;
};

export const AuthApi = {
  signup: (input: { name: string; email: string; password: string }) =>
    request<{ user: User; token: string }>("/auth/signup", { method: "POST", body: JSON.stringify(input) }),
  login: (input: { email: string; password: string }) =>
    request<{ user: User; token: string }>("/auth/login", { method: "POST", body: JSON.stringify(input) }),
  me: () => request<User>("/auth/me"),
  logout: () => request<{ message: string }>("/auth/logout", { method: "POST" }),
};

export const UsersApi = {
  list: (params: { page?: number; limit?: number }) =>
    request<PaginatedResponse<User>>(`/users${buildQuery(params)}`),
  updateRole: (id: string, role: Role) =>
    request<User>(`/users/${id}/role`, { method: "PATCH", body: JSON.stringify({ role }) }),
  invite: (input: { name: string; email: string; role: Role; temporaryPassword: string }) =>
    request<User>("/users/invite", { method: "POST", body: JSON.stringify(input) }),
};

export const ProjectsApi = {
  list: (params: { search?: string; status?: ProjectStatus; ownerId?: string; sortBy?: "dueDate"; sortOrder?: "asc" | "desc"; page?: number; limit?: number }) =>
    request<PaginatedResponse<Project>>(`/projects${buildQuery(params)}`),
  create: (input: { name: string; description?: string; status: ProjectStatus; startDate: string; dueDate: string }) =>
    request<Project>("/projects", { method: "POST", body: JSON.stringify(input) }),
  getById: (id: string) => request<Project>(`/projects/${id}`),
  addMember: (id: string, userId: string) =>
    request<{ message: string }>(`/projects/${id}/members`, { method: "POST", body: JSON.stringify({ userId }) }),
  removeMember: (id: string, userId: string) =>
    request<{ message: string }>(`/projects/${id}/members/${userId}`, { method: "DELETE" }),
  update: (id: string, input: Partial<{ name: string; description?: string; status: ProjectStatus; startDate: string; dueDate: string }>) =>
    request<Project>(`/projects/${id}`, { method: "PATCH", body: JSON.stringify(input) }),
  remove: (id: string) => request<{ message: string }>(`/projects/${id}`, { method: "DELETE" }),
};

export const TasksApi = {
  list: (params: {
    search?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    assigneeId?: string;
    projectId?: string;
    overdue?: boolean;
    sortBy?: "dueDate" | "priority" | "createdAt";
    sortOrder?: "asc" | "desc";
    page?: number;
    limit?: number;
  }) => request<PaginatedResponse<Task>>(`/tasks${buildQuery(params)}`),
  create: (input: { title: string; description?: string; projectId: string; assignedToId: string; status: TaskStatus; priority: TaskPriority; dueDate: string }) =>
    request<Task>("/tasks", { method: "POST", body: JSON.stringify(input) }),
  getById: (id: string) => request<Task>(`/tasks/${id}`),
  update: (id: string, input: Partial<{ title: string; description?: string; status: TaskStatus; priority: TaskPriority; dueDate: string }>) =>
    request<Task>(`/tasks/${id}`, { method: "PATCH", body: JSON.stringify(input) }),
  updateStatus: (id: string, status: TaskStatus) =>
    request<Task>(`/tasks/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),
  assign: (id: string, assignedToId: string) =>
    request<Task>(`/tasks/${id}/assign`, { method: "PATCH", body: JSON.stringify({ assignedToId }) }),
  remove: (id: string) => request<{ message: string }>(`/tasks/${id}`, { method: "DELETE" }),
};

export const DashboardApi = {
  summary: () => request<DashboardSummary>("/dashboard/summary"),
  activity: () => request<ActivityLog[]>("/dashboard/activity"),
  overdue: () => request<Task[]>("/dashboard/overdue"),
};

export const ActivityApi = {
  list: (params: { page?: number; limit?: number }) =>
    request<PaginatedResponse<ActivityLog>>(`/activity${buildQuery(params)}`),
};
