import { TaskStatus } from "@prisma/client";
import { prisma } from "../lib/prisma.js";

export const DashboardService = {
  async summary(actor: { id: string; role: "ADMIN" | "MEMBER" }) {
    const now = new Date();
    const in7Days = new Date();
    in7Days.setDate(in7Days.getDate() + 7);

    const projectWhere =
      actor.role === "ADMIN"
        ? {}
        : {
            OR: [{ ownerId: actor.id }, { members: { some: { userId: actor.id } } }],
          };

    const taskWhere =
      actor.role === "ADMIN"
        ? {}
        : {
            OR: [{ assignedToId: actor.id }, { project: { ownerId: actor.id } }, { project: { members: { some: { userId: actor.id } } } }],
          };

    const [
      totalProjects,
      totalTasks,
      completedTasks,
      overdueTasks,
      dueSoonTasks,
      tasksByStatus,
      recentActivity,
      myAssignedTasks,
    ] = await Promise.all([
      prisma.project.count({ where: projectWhere }),
      prisma.task.count({ where: taskWhere }),
      prisma.task.count({ where: { ...taskWhere, status: TaskStatus.DONE } }),
      prisma.task.count({ where: { ...taskWhere, dueDate: { lt: now }, status: { not: TaskStatus.DONE } } }),
      prisma.task.count({ where: { ...taskWhere, dueDate: { gte: now, lte: in7Days }, status: { not: TaskStatus.DONE } } }),
      prisma.task.groupBy({ by: ["status"], where: taskWhere, _count: { _all: true } }),
      prisma.activityLog.findMany({
        where: actor.role === "ADMIN" ? {} : { userId: actor.id },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      prisma.task.findMany({
        where: { ...taskWhere, assignedToId: actor.id },
        orderBy: { dueDate: "asc" },
        take: 10,
      }),
    ]);

    return {
      totalProjects,
      totalTasks,
      completedTasks,
      overdueTasks,
      dueSoonTasks,
      tasksByStatus,
      recentActivity,
      myAssignedTasks,
    };
  },

  async activity(actor: { id: string; role: "ADMIN" | "MEMBER" }) {
    return prisma.activityLog.findMany({
      where: actor.role === "ADMIN" ? {} : { userId: actor.id },
      include: { user: { select: { id: true, name: true, email: true, role: true } } },
      orderBy: { createdAt: "desc" },
      take: 25,
    });
  },

  async overdue(actor: { id: string; role: "ADMIN" | "MEMBER" }) {
    const now = new Date();

    return prisma.task.findMany({
      where: {
        dueDate: { lt: now },
        status: { not: TaskStatus.DONE },
        ...(actor.role === "ADMIN"
          ? {}
          : {
              OR: [{ assignedToId: actor.id }, { project: { ownerId: actor.id } }, { project: { members: { some: { userId: actor.id } } } }],
            }),
      },
      include: {
        project: { select: { id: true, name: true } },
        assignedTo: { select: { id: true, name: true, email: true } },
      },
      orderBy: { dueDate: "asc" },
    });
  },
};
