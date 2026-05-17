import "dotenv/config";


import bcrypt from "bcryptjs";
import {
  MemberRole,
  PrismaClient,
  ProjectStatus,
  Role,
  TaskPriority,
  TaskStatus,
} from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
  }),
});

const addDays = (date: Date, amount: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
};









const now = new Date();

async function main() {
  await prisma.activityLog.deleteMany();
  await prisma.task.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  const defaultPassword = await bcrypt.hash("Admin1234", 12);
  const memberPassword = await bcrypt.hash("Member1234", 12);

  const admin = await prisma.user.create({
    data: {
      name: "Alex Morgan",
      email: "admin@teamtask.dev",
      password: defaultPassword,
      role: Role.ADMIN,
    },
  });

  const members = await prisma.user.createManyAndReturn({
    data: [
      { name: "Priya Shah", email: "priya@teamtask.dev", password: memberPassword, role: Role.MEMBER },
      { name: "Daniel Reyes", email: "daniel@teamtask.dev", password: memberPassword, role: Role.MEMBER },
      { name: "Yuki Tanaka", email: "yuki@teamtask.dev", password: memberPassword, role: Role.MEMBER },
      { name: "Sofia Rossi", email: "sofia@teamtask.dev", password: memberPassword, role: Role.MEMBER },
    ],
  });

  const [priya, daniel, yuki, sofia] = members;

  const project1 = await prisma.project.create({
    data: {
      name: "Atlas Web Platform",
      description: "Customer-facing portal rebuild with new design system.",
      ownerId: admin.id,
      status: ProjectStatus.ACTIVE,
      startDate: addDays(now, -40),
      dueDate: addDays(now, 40),
      members: {
        create: [
          { userId: admin.id, assignedRole: MemberRole.OWNER },
          { userId: priya.id, assignedRole: MemberRole.MEMBER },
          { userId: daniel.id, assignedRole: MemberRole.MEMBER },
        ],
      },
    },
  });

  const project2 = await prisma.project.create({
    data: {
      name: "Mobile App v2",
      description: "Major mobile app refresh with offline sync.",
      ownerId: admin.id,
      status: ProjectStatus.ACTIVE,
      startDate: addDays(now, -25),
      dueDate: addDays(now, 20),
      members: {
        create: [
          { userId: admin.id, assignedRole: MemberRole.OWNER },
          { userId: yuki.id, assignedRole: MemberRole.MEMBER },
          { userId: sofia.id, assignedRole: MemberRole.MEMBER },
        ],
      },
    },
  });

  const tasks = await prisma.task.createManyAndReturn({
    data: [
      {
        title: "Wire up SSO login flow",
        description: "Integrate SAML provider and refresh handling.",
        projectId: project1.id,
        assignedToId: priya.id,
        createdById: admin.id,
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.HIGH,
        dueDate: addDays(now, 2),
      },
      {
        title: "Design empty state illustrations",
        description: "Dashboard and project empty states.",
        projectId: project1.id,
        assignedToId: daniel.id,
        createdById: admin.id,
        status: TaskStatus.REVIEW,
        priority: TaskPriority.MEDIUM,
        dueDate: addDays(now, -1),
      },
      {
        title: "Build offline sync queue",
        description: "Persist mutations and reconcile on reconnect.",
        projectId: project2.id,
        assignedToId: yuki.id,
        createdById: admin.id,
        status: TaskStatus.TODO,
        priority: TaskPriority.URGENT,
        dueDate: addDays(now, 1),
      },
      {
        title: "QA regression sweep",
        description: "Run smoke tests on iOS and Android.",
        projectId: project2.id,
        assignedToId: sofia.id,
        createdById: admin.id,
        status: TaskStatus.TODO,
        priority: TaskPriority.HIGH,
        dueDate: addDays(now, -3),
      },
    ],
  });

  await prisma.activityLog.createMany({
    data: [
      {
        action: "project_created",
        entityType: "project",
        entityId: project1.id,
        userId: admin.id,
        metadata: { projectName: project1.name },
      },
      {
        action: "task_created",
        entityType: "task",
        entityId: tasks[0].id,
        userId: admin.id,
        metadata: { taskTitle: tasks[0].title },
      },
      {
        action: "task_status_updated",
        entityType: "task",
        entityId: tasks[1].id,
        userId: daniel.id,
        metadata: { status: TaskStatus.REVIEW },
      },
      {
        action: "member_invited",
        entityType: "user",
        entityId: yuki.id,
        userId: admin.id,
      },
    ],
  });

  console.log("Seed completed");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
