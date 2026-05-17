import { type Prisma, TaskPriority, TaskStatus } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { AppError } from "../lib/errors.js";
import { ProjectService } from "./project.service.js";
import { ActivityService } from "./activity.service.js";

const taskInclude = {
  project: { select: { id: true, name: true, ownerId: true } },
  assignedTo: { select: { id: true, name: true, email: true, role: true } },
  createdBy: { select: { id: true, name: true, email: true, role: true } },
} as const;

const assertTaskAccess = async (taskId: string, actor: { id: string; role: "ADMIN" | "MEMBER" }) => {
  const task = await prisma.task.findUnique({ where: { id: taskId }, include: { project: { include: { members: true } } } });
  if (!task) throw new AppError(404, "Task not found", "TASK_NOT_FOUND");

  const inProject =
    task.project.ownerId === actor.id ||
    task.project.members.some((member) => member.userId === actor.id) ||
    actor.role === "ADMIN";

  if (!inProject) throw new AppError(403, "You do not have access to this task", "FORBIDDEN");
  return task;
};

const assertAssigneeInProject = async (projectId: string, assigneeId: string) => {
  const isMember = await prisma.projectMember.findUnique({ where: { projectId_userId: { projectId, userId: assigneeId } } });
  if (!isMember) {
    throw new AppError(400, "Task assignee must be a project member", "INVALID_ASSIGNEE");
  }
};

export const TaskService = {
  async list(
    actor: { id: string; role: "ADMIN" | "MEMBER" },
    query: {
      page: number;
      limit: number;
      search?: string;
      status?: TaskStatus;
      priority?: TaskPriority;
      assigneeId?: string;
      projectId?: string;
      overdue?: boolean;
      sortBy: "dueDate" | "priority" | "createdAt";
      sortOrder: "asc" | "desc";
    },
  ) {
    const now = new Date();
    const where: Prisma.TaskWhereInput = {
      ...(query.search ? { title: { contains: query.search, mode: "insensitive" } } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.priority ? { priority: query.priority } : {}),
      ...(query.assigneeId ? { assignedToId: query.assigneeId } : {}),
      ...(query.projectId ? { projectId: query.projectId } : {}),
      ...(query.overdue ? { dueDate: { lt: now }, status: { not: TaskStatus.DONE } } : {}),
      ...(actor.role === "MEMBER"
        ? {
            OR: [
              { assignedToId: actor.id },
              { project: { ownerId: actor.id } },
              { project: { members: { some: { userId: actor.id } } } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.task.findMany({
        where,
        include: taskInclude,
        orderBy: { [query.sortBy]: query.sortOrder },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      prisma.task.count({ where }),
    ]);

    return { items, total, page: query.page, limit: query.limit, totalPages: Math.ceil(total / query.limit) };
  },

  async create(
    actor: { id: string; role: "ADMIN" | "MEMBER" },
    input: {
      title: string;
      description?: string;
      projectId: string;
      assignedToId: string;
      status: TaskStatus;
      priority: TaskPriority;
      dueDate: string;
    },
  ) {
    if (actor.role !== "ADMIN") {
      throw new AppError(403, "Only admins can create tasks", "FORBIDDEN");
    }

    await ProjectService.canAccessProject(input.projectId, actor.id, actor.role);
    await assertAssigneeInProject(input.projectId, input.assignedToId);

    const task = await prisma.task.create({
      data: {
        title: input.title,
        description: input.description,
        projectId: input.projectId,
        assignedToId: input.assignedToId,
        createdById: actor.id,
        status: input.status,
        priority: input.priority,
        dueDate: new Date(input.dueDate),
      },
      include: taskInclude,
    });

    await ActivityService.log({ action: "task_created", entityType: "task", entityId: task.id, userId: actor.id });
    return task;
  },

  async getById(actor: { id: string; role: "ADMIN" | "MEMBER" }, id: string) {
    await assertTaskAccess(id, actor);
    return prisma.task.findUnique({ where: { id }, include: taskInclude });
  },

  async update(
    actor: { id: string; role: "ADMIN" | "MEMBER" },
    id: string,
    data: Partial<{ title: string; description?: string; status: TaskStatus; priority: TaskPriority; dueDate: string }>,
  ) {
    const task = await assertTaskAccess(id, actor);
    if (actor.role !== "ADMIN" && task.assignedToId !== actor.id) {
      throw new AppError(403, "Members can only update tasks assigned to them", "FORBIDDEN");
    }

    if (actor.role === "MEMBER" && (data.title || data.priority || data.dueDate)) {
      throw new AppError(403, "Members can only update task status and description", "FORBIDDEN");
    }

    const updated = await prisma.task.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        status: data.status,
        priority: data.priority,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      },
      include: taskInclude,
    });

    await ActivityService.log({ action: "task_updated", entityType: "task", entityId: id, userId: actor.id });
    return updated;
  },

  async remove(actor: { id: string; role: "ADMIN" | "MEMBER" }, id: string) {
    if (actor.role !== "ADMIN") {
      throw new AppError(403, "Only admins can delete tasks", "FORBIDDEN");
    }

    await assertTaskAccess(id, actor);
    await prisma.task.delete({ where: { id } });
    await ActivityService.log({ action: "task_deleted", entityType: "task", entityId: id, userId: actor.id });
  },

  async updateStatus(actor: { id: string; role: "ADMIN" | "MEMBER" }, id: string, status: TaskStatus) {
    const task = await assertTaskAccess(id, actor);
    if (actor.role !== "ADMIN" && task.assignedToId !== actor.id) {
      throw new AppError(403, "Members can only update tasks assigned to them", "FORBIDDEN");
    }

    const updated = await prisma.task.update({ where: { id }, data: { status }, include: taskInclude });
    await ActivityService.log({ action: "task_status_updated", entityType: "task", entityId: id, userId: actor.id, metadata: { status } });
    return updated;
  },

  async assign(actor: { id: string; role: "ADMIN" | "MEMBER" }, id: string, assignedToId: string) {
    if (actor.role !== "ADMIN") {
      throw new AppError(403, "Only admins can assign tasks", "FORBIDDEN");
    }

    const task = await assertTaskAccess(id, actor);
    await assertAssigneeInProject(task.projectId, assignedToId);

    const updated = await prisma.task.update({ where: { id }, data: { assignedToId }, include: taskInclude });
    await ActivityService.log({ action: "task_assigned", entityType: "task", entityId: id, userId: actor.id, metadata: { assignedToId } });
    return updated;
  },
};
