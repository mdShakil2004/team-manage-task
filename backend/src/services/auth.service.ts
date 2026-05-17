import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";
import { AppError } from "../lib/errors.js";
import { signAccessToken } from "../lib/auth.js";

const publicUserSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  createdAt: true,
  updatedAt: true,
} as const;

export const AuthService = {
  async signup(input: { name: string; email: string; password: string }) {
    const existing = await prisma.user.findUnique({ where: { email: input.email } });
    if (existing) {
      throw new AppError(409, "Email already in use", "DUPLICATE_EMAIL");
    }

    const password = await bcrypt.hash(input.password, 12);
    const user = await prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        password,
      },
      select: publicUserSelect,
    });

    const token = signAccessToken({ sub: user.id, role: user.role });
    return { user, token };
  },

  async login(input: { email: string; password: string }) {
    const user = await prisma.user.findUnique({ where: { email: input.email } });
    if (!user) throw new AppError(401, "Invalid credentials", "INVALID_CREDENTIALS");

    const isValid = await bcrypt.compare(input.password, user.password);
    if (!isValid) throw new AppError(401, "Invalid credentials", "INVALID_CREDENTIALS");

    const token = signAccessToken({ sub: user.id, role: user.role });
    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };
  },

  async me(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: publicUserSelect });
    if (!user) throw new AppError(404, "User not found", "USER_NOT_FOUND");
    return user;
  },
};
