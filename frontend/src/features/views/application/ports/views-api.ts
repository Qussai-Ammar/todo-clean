import type { Task, TaskStatus } from "../../../tasks/index.js";

export interface KanbanColumn {
  status: TaskStatus;
  tasks: Task[];
}

export interface ViewsApi {
  getListView(projectId: string): Promise<Task[]>;
  getKanbanView(projectId: string): Promise<KanbanColumn[]>;
}
