import type { ErrorRequestHandler, RequestHandler } from "express";
import { AppError } from "../lib/errors.js";

export const notFound: RequestHandler = (_req, _res, next) => {
  next(new AppError(404, "Route not found", "NOT_FOUND"));
};

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      success: false,
      message: error.message,
      errorCode: error.errorCode,
      details: error.details,
    });
    return;
  }

  console.error(error);
  res.status(500).json({
    success: false,
    message: "Something went wrong",
    errorCode: "INTERNAL_SERVER_ERROR",
  });
};
