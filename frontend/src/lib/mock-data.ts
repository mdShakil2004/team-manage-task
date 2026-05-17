export type Role = "Admin" | "Member";
export type TaskStatus = "Todo" | "In Progress" | "Review" | "Done";
export type Priority = "Low" | "Medium" | "High" | "Urgent";
export type ProjectStatus = "Planning" | "Active" | "On Hold" | "Completed";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  initials: string;
  title: string;
  projectsCount: number;
  tasksCount: number;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  startDate: string;
  dueDate: string;
  progress: number;
  members: string[]; // user ids
  taskCount: number;
  completedTasks: number;
  color: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  projectId: string;
  assigneeId: string;
  status: TaskStatus;
  priority: Priority;
  dueDate: string;
  createdBy: string;
  createdAt: string;
}

export interface Activity {
  id: string;
  userId: string;
  action: string;
  target: string;
  targetType: "task" | "project" | "member";
  timestamp: string;
}

export const users: User[] = [
  { id: "u1", name: "Alex Morgan", email: "alex@acme.co", role: "Admin", initials: "AM", title: "Product Lead", projectsCount: 8, tasksCount: 24 },
  { id: "u2", name: "Priya Shah", email: "priya@acme.co", role: "Member", initials: "PS", title: "Senior Engineer", projectsCount: 5, tasksCount: 18 },
  { id: "u3", name: "Daniel Reyes", email: "daniel@acme.co", role: "Member", initials: "DR", title: "Designer", projectsCount: 4, tasksCount: 12 },
  { id: "u4", name: "Yuki Tanaka", email: "yuki@acme.co", role: "Admin", initials: "YT", title: "Engineering Manager", projectsCount: 7, tasksCount: 9 },
  { id: "u5", name: "Marcus Chen", email: "marcus@acme.co", role: "Member", initials: "MC", title: "Frontend Engineer", projectsCount: 3, tasksCount: 15 },
  { id: "u6", name: "Sofia Rossi", email: "sofia@acme.co", role: "Member", initials: "SR", title: "QA Engineer", projectsCount: 4, tasksCount: 21 },
  { id: "u7", name: "Olivia Bennett", email: "olivia@acme.co", role: "Member", initials: "OB", title: "Marketing", projectsCount: 2, tasksCount: 7 },
];

export const currentUserId = "u1"; // signed-in as Alex (Admin)

export const projects: Project[] = [
  {
    id: "p1",
    name: "Atlas Web Platform",
    description: "Customer-facing portal rebuild with new design system and SSR.",
    status: "Active",
    startDate: "2026-03-10",
    dueDate: "2026-06-30",
    progress: 64,
    members: ["u1", "u2", "u3", "u5"],
    taskCount: 42,
    completedTasks: 27,
    color: "oklch(0.52 0.17 258)",
  },
  {
    id: "p2",
    name: "Mobile App v2",
    description: "iOS and Android refresh with offline-first sync.",
    status: "Active",
    startDate: "2026-04-01",
    dueDate: "2026-05-22",
    progress: 41,
    members: ["u1", "u4", "u5", "u6"],
    taskCount: 28,
    completedTasks: 11,
    color: "oklch(0.65 0.16 155)",
  },
  {
    id: "p3",
    name: "Internal Analytics",
    description: "Self-serve dashboards for product and growth teams.",
    status: "Planning",
    startDate: "2026-05-15",
    dueDate: "2026-08-10",
    progress: 12,
    members: ["u2", "u4", "u7"],
    taskCount: 16,
    completedTasks: 2,
    color: "oklch(0.62 0.18 300)",
  },
  {
    id: "p4",
    name: "Q2 Marketing Site",
    description: "Launch microsite for the spring campaign.",
    status: "On Hold",
    startDate: "2026-02-20",
    dueDate: "2026-05-05",
    progress: 78,
    members: ["u3", "u7"],
    taskCount: 19,
    completedTasks: 15,
    color: "oklch(0.76 0.16 70)",
  },
  {
    id: "p5",
    name: "Billing Migration",
    description: "Move legacy billing to the new ledger service.",
    status: "Active",
    startDate: "2026-03-25",
    dueDate: "2026-07-01",
    progress: 33,
    members: ["u1", "u2", "u4"],
    taskCount: 24,
    completedTasks: 8,
    color: "oklch(0.58 0.22 27)",
  },
  {
    id: "p6",
    name: "Onboarding Revamp",
    description: "Reduce time-to-value for new accounts to under 5 minutes.",
    status: "Completed",
    startDate: "2026-01-10",
    dueDate: "2026-04-15",
    progress: 100,
    members: ["u1", "u3", "u6"],
    taskCount: 22,
    completedTasks: 22,
    color: "oklch(0.62 0.15 230)",
  },
];

const today = new Date("2026-05-16");
const d = (offset: number) => {
  const x = new Date(today);
  x.setDate(x.getDate() + offset);
  return x.toISOString().slice(0, 10);
};

export const tasks: Task[] = [
  { id: "t1", title: "Wire up SSO login flow", description: "Integrate the new SAML provider and add session refresh handling.", projectId: "p1", assigneeId: "u2", status: "In Progress", priority: "High", dueDate: d(2), createdBy: "u1", createdAt: d(-7) },
  { id: "t2", title: "Design empty state illustrations", description: "Cover dashboard, projects, tasks, and members empty states.", projectId: "p1", assigneeId: "u3", status: "Review", priority: "Medium", dueDate: d(-1), createdBy: "u1", createdAt: d(-10) },
  { id: "t3", title: "Audit color contrast tokens", description: "Ensure AA compliance across both themes.", projectId: "p1", assigneeId: "u3", status: "Done", priority: "Low", dueDate: d(-5), createdBy: "u4", createdAt: d(-14) },
  { id: "t4", title: "Build offline sync queue", description: "Persist mutations locally and reconcile on reconnect.", projectId: "p2", assigneeId: "u5", status: "In Progress", priority: "Urgent", dueDate: d(1), createdBy: "u4", createdAt: d(-6) },
  { id: "t5", title: "QA: regression sweep v2.0.1", description: "Run smoke tests on iOS 17 and Android 14.", projectId: "p2", assigneeId: "u6", status: "Todo", priority: "High", dueDate: d(4), createdBy: "u4", createdAt: d(-3) },
  { id: "t6", title: "Spec the cohort retention chart", description: "Define metrics, filters, and drilldown behavior.", projectId: "p3", assigneeId: "u2", status: "Todo", priority: "Medium", dueDate: d(7), createdBy: "u1", createdAt: d(-2) },
  { id: "t7", title: "Stakeholder review – analytics", description: "Walk leadership through proposed scope.", projectId: "p3", assigneeId: "u4", status: "Review", priority: "Medium", dueDate: d(3), createdBy: "u1", createdAt: d(-4) },
  { id: "t8", title: "Refresh hero copy", description: "Align headline with campaign messaging.", projectId: "p4", assigneeId: "u7", status: "Done", priority: "Low", dueDate: d(-8), createdBy: "u3", createdAt: d(-20) },
  { id: "t9", title: "Migrate legacy invoices", description: "Backfill last 24 months of invoices into new schema.", projectId: "p5", assigneeId: "u2", status: "In Progress", priority: "Urgent", dueDate: d(-2), createdBy: "u1", createdAt: d(-9) },
  { id: "t10", title: "Reconciliation dashboard", description: "Surface mismatches between legacy and ledger totals.", projectId: "p5", assigneeId: "u4", status: "Todo", priority: "High", dueDate: d(9), createdBy: "u1", createdAt: d(-1) },
  { id: "t11", title: "Tighten task drawer keyboard nav", description: "Trap focus and add escape-to-close.", projectId: "p1", assigneeId: "u5", status: "Todo", priority: "Medium", dueDate: d(6), createdBy: "u1", createdAt: d(-1) },
  { id: "t12", title: "Customer interviews – activation", description: "Schedule 8 interviews with new accounts this month.", projectId: "p1", assigneeId: "u1", status: "In Progress", priority: "Medium", dueDate: d(5), createdBy: "u1", createdAt: d(-5) },
  { id: "t13", title: "Push notification opt-in screen", description: "Show on second app launch with friendly copy.", projectId: "p2", assigneeId: "u3", status: "Review", priority: "Low", dueDate: d(2), createdBy: "u4", createdAt: d(-4) },
  { id: "t14", title: "Pricing page A/B test", description: "Test annual-toggle default state.", projectId: "p4", assigneeId: "u7", status: "Todo", priority: "Medium", dueDate: d(10), createdBy: "u1", createdAt: d(0) },
  { id: "t15", title: "Set up nightly data export", description: "Snapshot core tables to the warehouse daily at 2am.", projectId: "p3", assigneeId: "u4", status: "Todo", priority: "High", dueDate: d(-3), createdBy: "u1", createdAt: d(-6) },
  { id: "t16", title: "Onboarding checklist polish", description: "Tighten copy and add a celebratory finish state.", projectId: "p6", assigneeId: "u3", status: "Done", priority: "Medium", dueDate: d(-12), createdBy: "u1", createdAt: d(-30) },
];

export const activities: Activity[] = [
  { id: "a1", userId: "u2", action: "completed", target: "Audit color contrast tokens", targetType: "task", timestamp: "2h ago" },
  { id: "a2", userId: "u1", action: "created project", target: "Billing Migration", targetType: "project", timestamp: "4h ago" },
  { id: "a3", userId: "u4", action: "assigned a task to", target: "Priya Shah", targetType: "member", timestamp: "5h ago" },
  { id: "a4", userId: "u3", action: "moved to review", target: "Design empty state illustrations", targetType: "task", timestamp: "Yesterday" },
  { id: "a5", userId: "u5", action: "commented on", target: "Build offline sync queue", targetType: "task", timestamp: "Yesterday" },
  { id: "a6", userId: "u6", action: "filed a bug on", target: "Mobile App v2", targetType: "project", timestamp: "2d ago" },
  { id: "a7", userId: "u1", action: "invited", target: "Olivia Bennett", targetType: "member", timestamp: "3d ago" },
  { id: "a8", userId: "u2", action: "closed", target: "Onboarding checklist polish", targetType: "task", timestamp: "5d ago" },
];

export const findUser = (id: string) => users.find((u) => u.id === id)!;
export const findProject = (id: string) => projects.find((p) => p.id === id)!;

export const isOverdue = (dueDate: string, status: TaskStatus) => {
  if (status === "Done") return false;
  return new Date(dueDate) < today;
};

export const todayDate = today;
