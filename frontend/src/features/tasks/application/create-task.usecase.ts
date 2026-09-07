import { Task } from "../domain/task.js";
import { CreateTaskInput, TasksApi } from "./ports/tasks-api.js";

export class CreateTaskUseCase {
  constructor(private readonly tasksApi: TasksApi) {}

  execute(input: CreateTaskInput): Promise<Task> {
    return this.tasksApi.create(input);
  }
}
