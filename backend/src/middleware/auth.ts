import type { RequestHandler } from "express";
import { AppError } from "../lib/errors.js";
import { verifyAccessToken } from "../lib/auth.js";

export const authenticate: RequestHandler = (req, _res, next) => {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;

  if (!token) {
    next(new AppError(401, "Authentication required", "AUTH_REQUIRED"));
    return;
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub, role: payload.role };
    next();
  } catch {
    next(new AppError(401, "Invalid or expired token", "INVALID_TOKEN"));
  }
};
