import { HttpClient } from "../../shared/http-client.js";
import { ToastManager } from "../../shared/toast.js";
import { TasksController } from "../tasks/index.js";
import { GetKanbanViewUseCase } from "./application/get-kanban-view.usecase.js";
import { GetListViewUseCase } from "./application/get-list-view.usecase.js";
import { HttpViewsApi } from "./infrastructure/http-views-api.js";
import { ViewsController } from "./presentation/views.controller.js";

export function createViewsFeature(deps: {
  http: HttpClient;
  toast: ToastManager;
  tasksController: TasksController;
}): ViewsController {
  const viewsApi = new HttpViewsApi(deps.http);

  return new ViewsController(
    new GetListViewUseCase(viewsApi),
    new GetKanbanViewUseCase(viewsApi),
    deps.tasksController,
    deps.toast
  );
}

export { ViewsController } from "./presentation/views.controller.js";
