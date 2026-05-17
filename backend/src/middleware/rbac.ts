import type { RequestHandler } from "express";
import type { Role } from "@prisma/client";
import { AppError } from "../lib/errors.js";

export const authorizeRoles = (...roles: Role[]): RequestHandler => {
  return (req, _res, next) => {
    if (!req.user) {
      next(new AppError(401, "Authentication required", "AUTH_REQUIRED"));
      return;
    }

    if (!roles.includes(req.user.role)) {
      next(new AppError(403, "Permission denied", "FORBIDDEN"));
      return;
    }

    next();
  };
};
