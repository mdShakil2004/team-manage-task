import jwt from "jsonwebtoken";
import { env } from "./env.js";

export type JwtPayload = {
  sub: string;
  role: "ADMIN" | "MEMBER";
};

export const signAccessToken = (payload: JwtPayload): string =>
  jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"] });

export const verifyAccessToken = (token: string): JwtPayload =>
  jwt.verify(token, env.JWT_SECRET) as JwtPayload;
