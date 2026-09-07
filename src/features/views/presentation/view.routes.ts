import { RequestHandler, Router } from "express";
import { asyncHandler } from "../../../shared/infrastructure/http/async-handler";
import { ViewController } from "./view.controller";

export function createViewRoutes(controller: ViewController, requireAuth: RequestHandler): Router {
  const router = Router();

  router.use(requireAuth);

  router.get("/:projectId/list", asyncHandler(controller.list));
  router.get("/:projectId/kanban", asyncHandler(controller.kanban));

  return router;
}
