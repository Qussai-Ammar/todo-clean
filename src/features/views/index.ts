import { RequestHandler, Router } from "express";
import { ProjectAccessPolicy } from "../../shared/application/ports/project-access-policy";
import { GetKanbanViewUseCase } from "./application/get-kanban-view.usecase";
import { GetListViewUseCase } from "./application/get-list-view.usecase";
import { TaskReader } from "./application/ports/task-reader";
import { ViewController } from "./presentation/view.controller";
import { createViewRoutes } from "./presentation/view.routes";

export interface ViewsModuleDeps {
  taskReader: TaskReader;
  accessPolicy: ProjectAccessPolicy;
  requireAuth: RequestHandler;
}

export interface ViewsModule {
  routes: Router;
}

export function createViewsModule(deps: ViewsModuleDeps): ViewsModule {
  const { taskReader, accessPolicy, requireAuth } = deps;

  const getListViewUseCase = new GetListViewUseCase(taskReader, accessPolicy);
  const getKanbanViewUseCase = new GetKanbanViewUseCase(taskReader, accessPolicy);

  const controller = new ViewController(getListViewUseCase, getKanbanViewUseCase);
  const routes = createViewRoutes(controller, requireAuth);

  return { routes };
}
