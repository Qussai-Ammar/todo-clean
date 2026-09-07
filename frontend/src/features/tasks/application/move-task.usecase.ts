import { Task } from "../domain/task.js";
import { MoveTaskInput, TasksApi } from "./ports/tasks-api.js";

export class MoveTaskUseCase {
  constructor(private readonly tasksApi: TasksApi) {}

  execute(id: string, input: MoveTaskInput): Promise<Task> {
    return this.tasksApi.move(id, input);
  }
}
