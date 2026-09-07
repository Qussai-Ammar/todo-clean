import { TasksApi } from "./ports/tasks-api.js";

export class DeleteTaskUseCase {
  constructor(private readonly tasksApi: TasksApi) {}

  execute(id: string): Promise<void> {
    return this.tasksApi.remove(id);
  }
}
