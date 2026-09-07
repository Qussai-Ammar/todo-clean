import { RequestHandler, Router } from "express";
import { ProjectAccessPolicy } from "../../shared/application/ports/project-access-policy";
import { CreateTaskUseCase } from "./application/create-task.usecase";
import { DeleteTaskUseCase } from "./application/delete-task.usecase";
import { ListTasksUseCase } from "./application/list-tasks.usecase";
import { MoveTaskUseCase } from "./application/move-task.usecase";
import { UpdateTaskUseCase } from "./application/update-task.usecase";
import { TaskRepository } from "./domain/task.repository";
import { InMemoryTaskRepository } from "./infrastructure/in-memory-task.repository";
import { TaskController } from "./presentation/task.controller";
import { createTaskRoutes } from "./presentation/task.routes";

export interface TasksModuleDeps {
  taskRepository: TaskRepository;
  accessPolicy: ProjectAccessPolicy;
  requireAuth: RequestHandler;
}

export interface TasksModule {
  routes: Router;
}

export function createTaskRepository(): TaskRepository {
  return new InMemoryTaskRepository();
}

export function createTasksModule(deps: TasksModuleDeps): TasksModule {
  const { taskRepository, accessPolicy, requireAuth } = deps;

  const createTaskUseCase = new CreateTaskUseCase(taskRepository, accessPolicy);
  const listTasksUseCase = new ListTasksUseCase(taskRepository, accessPolicy);
  const updateTaskUseCase = new UpdateTaskUseCase(taskRepository, accessPolicy);
  const moveTaskUseCase = new MoveTaskUseCase(taskRepository, accessPolicy);
  const deleteTaskUseCase = new DeleteTaskUseCase(taskRepository, accessPolicy);

  const controller = new TaskController(
    createTaskUseCase,
    listTasksUseCase,
    updateTaskUseCase,
    moveTaskUseCase,
    deleteTaskUseCase
  );

  const routes = createTaskRoutes(controller, requireAuth);

  return { routes };
}

export type { Task } from "./domain/task.entity";
export type { TaskRepository } from "./domain/task.repository";
export type { TaskStatus } from "./domain/task-status";
