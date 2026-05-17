import { MemberRole, type Prisma, ProjectStatus } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { AppError } from "../lib/errors.js";
import { ActivityService } from "./activity.service.js";

const projectInclude = {
  owner: { select: { id: true, name: true, email: true, role: true } },
  members: {
    include: {
      user: { select: { id: true, name: true, email: true, role: true } },
    },
  },
  tasks: true,
} as const;

const assertProjectAccess = async (projectId: string, userId: string, role: "ADMIN" | "MEMBER") => {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { members: true },
  });

  if (!project) throw new AppError(404, "Project not found", "PROJECT_NOT_FOUND");

  const isMember = project.ownerId === userId || project.members.some((member) => member.userId === userId);
  if (role !== "ADMIN" && !isMember) {
    throw new AppError(403, "You do not have access to this project", "FORBIDDEN");
  }

  return project;
};

export const ProjectService = {
  async list(
    actor: { id: string; role: "ADMIN" | "MEMBER" },
    query: {
      page: number;
      limit: number;
      search?: string;
      status?: ProjectStatus;
      ownerId?: string;
      sortOrder: "asc" | "desc";
    },
  ) {
    const where: Prisma.ProjectWhereInput = {
      ...(query.search ? { name: { contains: query.search, mode: "insensitive" } } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.ownerId ? { ownerId: query.ownerId } : {}),
      ...(actor.role === "MEMBER"
        ? {
            OR: [{ ownerId: actor.id }, { members: { some: { userId: actor.id } } }],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.project.findMany({
        where,
        include: projectInclude,
        orderBy: { dueDate: query.sortOrder },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      prisma.project.count({ where }),
    ]);

    return { items, total, page: query.page, limit: query.limit, totalPages: Math.ceil(total / query.limit) };
  },

  async create(actorId: string, input: { name: string; description?: string; status: ProjectStatus; startDate: string; dueDate: string }) {
    const project = await prisma.project.create({
      data: {
        name: input.name,
        description: input.description,
        ownerId: actorId,
        status: input.status,
        startDate: new Date(input.startDate),
        dueDate: new Date(input.dueDate),
        members: {
          create: { userId: actorId, assignedRole: MemberRole.OWNER },
        },
      },
      include: projectInclude,
    });

    await ActivityService.log({ action: "project_created", entityType: "project", entityId: project.id, userId: actorId });
    return project;
  },

  async getById(actor: { id: string; role: "ADMIN" | "MEMBER" }, id: string) {
    await assertProjectAccess(id, actor.id, actor.role);
    return prisma.project.findUnique({ where: { id }, include: projectInclude });
  },

  async update(
    actor: { id: string; role: "ADMIN" | "MEMBER" },
    id: string,
    data: Partial<{ name: string; description?: string; status: ProjectStatus; startDate: string; dueDate: string }>,
  ) {
    const project = await assertProjectAccess(id, actor.id, actor.role);
    if (actor.role !== "ADMIN" && project.ownerId !== actor.id) {
      throw new AppError(403, "Only project owner or admin can update project", "FORBIDDEN");
    }

    const updated = await prisma.project.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        status: data.status,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      },
      include: projectInclude,
    });

    await ActivityService.log({ action: "project_updated", entityType: "project", entityId: id, userId: actor.id });
    return updated;
  },

  async remove(actor: { id: string; role: "ADMIN" | "MEMBER" }, id: string) {
    const project = await assertProjectAccess(id, actor.id, actor.role);
    if (actor.role !== "ADMIN" && project.ownerId !== actor.id) {
      throw new AppError(403, "Only project owner or admin can delete project", "FORBIDDEN");
    }

    await prisma.project.delete({ where: { id } });
    await ActivityService.log({ action: "project_deleted", entityType: "project", entityId: id, userId: actor.id });
  },

  async addMember(actor: { id: string; role: "ADMIN" | "MEMBER" }, projectId: string, userId: string) {
    const project = await assertProjectAccess(projectId, actor.id, actor.role);
    if (actor.role !== "ADMIN" && project.ownerId !== actor.id) {
      throw new AppError(403, "Only project owner or admin can add members", "FORBIDDEN");
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError(404, "User not found", "USER_NOT_FOUND");

    const existing = await prisma.projectMember.findUnique({ where: { projectId_userId: { projectId, userId } } });
    if (existing) throw new AppError(409, "User is already a project member", "MEMBER_EXISTS");

    await prisma.projectMember.create({ data: { projectId, userId, assignedRole: MemberRole.MEMBER } });
    await ActivityService.log({ action: "project_member_added", entityType: "project", entityId: projectId, userId: actor.id, metadata: { userId } });
  },

  async removeMember(actor: { id: string; role: "ADMIN" | "MEMBER" }, projectId: string, userId: string) {
    const project = await assertProjectAccess(projectId, actor.id, actor.role);
    if (actor.role !== "ADMIN" && project.ownerId !== actor.id) {
      throw new AppError(403, "Only project owner or admin can remove members", "FORBIDDEN");
    }

    const member = await prisma.projectMember.findUnique({ where: { projectId_userId: { projectId, userId } } });
    if (!member) throw new AppError(404, "Project member not found", "PROJECT_MEMBER_NOT_FOUND");
    if (member.assignedRole === MemberRole.OWNER) {
      throw new AppError(400, "Cannot remove project owner", "INVALID_OPERATION");
    }

    await prisma.projectMember.delete({ where: { projectId_userId: { projectId, userId } } });
    await ActivityService.log({ action: "project_member_removed", entityType: "project", entityId: projectId, userId: actor.id, metadata: { userId } });
  },

  async canAccessProject(projectId: string, userId: string, role: "ADMIN" | "MEMBER") {
    await assertProjectAccess(projectId, userId, role);
  },
};
