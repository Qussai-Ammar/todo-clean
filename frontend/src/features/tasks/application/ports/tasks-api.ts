import { Task, TaskStatus } from "../../domain/task.js";

export interface CreateTaskInput {
  projectId: string;
  title: string;
  description?: string;
  assigneeId?: string | null;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  assigneeId?: string | null;
}

export interface MoveTaskInput {
  status: TaskStatus;
  position: number;
}

export interface TasksApi {
  listByProject(projectId: string): Promise<Task[]>;
  create(input: CreateTaskInput): Promise<Task>;
  update(id: string, input: UpdateTaskInput): Promise<Task>;
  move(id: string, input: MoveTaskInput): Promise<Task>;
  remove(id: string): Promise<void>;
}
