import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import routes from "./routes/index.js";
import { env } from "./lib/env.js";
import { errorHandler, notFound } from "./middleware/error-handler.js";
import { sanitizeInputs } from "./middleware/sanitize.js";

export const app = express();

const allowedOrigins = env.CORS_ORIGIN.split(",").map((origin) => origin.trim()).filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Origin not allowed by CORS"));
    },
    credentials: false,
  }),
);
app.use(helmet());
app.use(morgan("dev"));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(sanitizeInputs);

app.get("/health", (_req, res) => {
  res.status(200).json({ success: true, message: "OK" });
});
app.get("/ready", (_req, res) => {
  res.send("working fine")
});

app.use("/api", routes);

app.use(notFound);
app.use(errorHandler);
