import cors from "cors";
import path from "path";
import express, { Express } from "express";
import { buildContainer } from "./composition/container";
import { AuthModuleConfig } from "./features/auth";
import { errorHandler, notFoundHandler } from "./shared/infrastructure/http/error-handler";

export function createApp(config: AuthModuleConfig): Express {
  const app = express();
  const routes = buildContainer(config);

  app.use(cors());
  app.use(express.json());
  app.use(express.static(path.join(__dirname, "..", "public")));

  app.get("/health", (_req, res) => res.status(200).json({ status: "ok" }));

  app.use("/api/auth", routes.auth);
  app.use("/api/projects", routes.projects);
  app.use("/api/tasks", routes.tasks);
  app.use("/api/views", routes.views);
  app.use("/api/projects", routes.collaboration);

  // SPA fallback: any non-API, non-static path (a client-side route like
  // /login or /projects/:id/kanban) serves the app shell so the frontend
  // router can take over — otherwise a deep link or a page refresh 404s.
  app.get(/^\/(?!api\/|health$).*/, (_req, res) => {
    res.sendFile(path.join(__dirname, "..", "public", "index.html"));
  });

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
