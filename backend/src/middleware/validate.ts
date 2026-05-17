import type { RequestHandler } from "express";
import { type ZodTypeAny, ZodError } from "zod";
import { AppError } from "../lib/errors.js";

export const validate = (schema: ZodTypeAny, target: "body" | "query" | "params" = "body"): RequestHandler => {
  return (req, _res, next) => {
    try {
      req[target] = schema.parse(req[target]);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        next(new AppError(400, "Validation failed", "VALIDATION_ERROR", error.flatten()));
        return;
      }
      next(error);
    }
  };
};
