import { Task } from "../domain/task.js";
import { TasksApi, UpdateTaskInput } from "./ports/tasks-api.js";

export class UpdateTaskUseCase {
  constructor(private readonly tasksApi: TasksApi) {}

  execute(id: string, input: UpdateTaskInput): Promise<Task> {
    return this.tasksApi.update(id, input);
  }
}
