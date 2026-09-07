import { HttpClient } from "../../../shared/http-client.js";
import { Task } from "../domain/task.js";
import { CreateTaskInput, MoveTaskInput, TasksApi, UpdateTaskInput } from "../application/ports/tasks-api.js";

export class HttpTasksApi implements TasksApi {
  constructor(private readonly http: HttpClient) {}

  listByProject(projectId: string): Promise<Task[]> {
    return this.http.get<Task[]>(`/tasks/project/${projectId}`);
  }

  create(input: CreateTaskInput): Promise<Task> {
    return this.http.post<Task>("/tasks", input);
  }

  update(id: string, input: UpdateTaskInput): Promise<Task> {
    return this.http.patch<Task>(`/tasks/${id}`, input);
  }

  move(id: string, input: MoveTaskInput): Promise<Task> {
    return this.http.patch<Task>(`/tasks/${id}/move`, input);
  }

  remove(id: string): Promise<void> {
    return this.http.delete<void>(`/tasks/${id}`);
  }
}
