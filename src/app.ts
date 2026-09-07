import cors from "cors";
import path from "path";
import express, { Express } from "express";
import { buildContainer } from "./composition/container";
import { errorHandler, notFoundHandler } from "./shared/infrastructure/http/error-handler";

export function createApp(jwtSecret: string): Express {
  const app = express();
  const routes = buildContainer(jwtSecret);

  app.use(cors());
  app.use(express.json());
  app.use(express.static(path.join(__dirname, "..", "public")));

  app.get("/health", (_req, res) => res.status(200).json({ status: "ok" }));

  app.use("/api/auth", routes.auth);
  app.use("/api/projects", routes.projects);
  app.use("/api/tasks", routes.tasks);
  app.use("/api/views", routes.views);
  app.use("/api/projects", routes.collaboration);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
