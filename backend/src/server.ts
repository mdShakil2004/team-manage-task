import { app } from "./app.js";
import { env } from "./lib/env.js";
import { prisma } from "./lib/prisma.js";

const start = async () => {
  try {
    await prisma.$connect();
    app.listen(env.PORT, () => {
      console.log(`Server listening on http://localhost:${env.PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server", error);
    process.exit(1);
  }
};

start();
