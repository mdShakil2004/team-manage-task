import type { RequestHandler } from "express";

const trimStrings = (value: unknown): unknown => {
  if (typeof value === "string") return value.trim();

  if (Array.isArray(value)) {
    return value.map(trimStrings);
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, val]) => [
        key,
        trimStrings(val),
      ]),
    );
  }

  return value;
};

export const sanitizeInputs: RequestHandler = (req, _res, next) => {
  // body
  if (req.body && typeof req.body === "object") {
    Object.assign(req.body, trimStrings(req.body));
  }

  // query
  if (req.query && typeof req.query === "object") {
    Object.assign(req.query, trimStrings(req.query));
  }

  // params
  if (req.params && typeof req.params === "object") {
    Object.assign(req.params, trimStrings(req.params));
  }

  next();
};