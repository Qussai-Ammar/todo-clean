import { DialogManager } from "../../shared/dialog.js";
import { HttpClient } from "../../shared/http-client.js";
import { ToastManager } from "../../shared/toast.js";
import { CreateTaskUseCase } from "./application/create-task.usecase.js";
import { DeleteTaskUseCase } from "./application/delete-task.usecase.js";
import { MoveTaskUseCase } from "./application/move-task.usecase.js";
import { UpdateTaskUseCase } from "./application/update-task.usecase.js";
import { HttpTasksApi } from "./infrastructure/http-tasks-api.js";
import { TasksController } from "./presentation/tasks.controller.js";

export function createTasksFeature(deps: { http: HttpClient; toast: ToastManager; dialogs: DialogManager }): TasksController {
  const tasksApi = new HttpTasksApi(deps.http);

  return new TasksController(
    new CreateTaskUseCase(tasksApi),
    new UpdateTaskUseCase(tasksApi),
    new MoveTaskUseCase(tasksApi),
    new DeleteTaskUseCase(tasksApi),
    deps.toast,
    deps.dialogs
  );
}

export type { Task, TaskStatus } from "./domain/task.js";
export { TASK_STATUSES, TASK_STATUS_LABELS } from "./domain/task.js";
export { TasksController } from "./presentation/tasks.controller.js";
