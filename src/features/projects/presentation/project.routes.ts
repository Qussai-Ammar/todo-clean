import { RequestHandler, Router } from "express";
import { asyncHandler } from "../../../shared/infrastructure/http/async-handler";
import { validateBody } from "../../../shared/infrastructure/http/validate";
import { ProjectController } from "./project.controller";
import { createProjectSchema, updateProjectSchema } from "./dtos";

export function createProjectRoutes(controller: ProjectController, requireAuth: RequestHandler): Router {
  const router = Router();

  router.use(requireAuth);

  router.post("/", validateBody(createProjectSchema), asyncHandler(controller.create));
  router.get("/", asyncHandler(controller.list));
  router.get("/:projectId", asyncHandler(controller.getById));
  router.patch("/:projectId", validateBody(updateProjectSchema), asyncHandler(controller.update));
  router.delete("/:projectId", asyncHandler(controller.remove));

  return router;
}
