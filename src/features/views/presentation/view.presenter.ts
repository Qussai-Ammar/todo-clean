import type { Task } from "../../tasks";
import { toTaskResponse, TaskResponse } from "../../tasks/presentation/task.presenter";
import { KanbanColumn } from "../application/get-kanban-view.usecase";

export interface ListViewResponse {
  tasks: TaskResponse[];
}

export interface KanbanViewResponse {
  columns: { status: string; tasks: TaskResponse[] }[];
}

export function toListViewResponse(tasks: Task[]): ListViewResponse {
  return { tasks: tasks.map(toTaskResponse) };
}

export function toKanbanViewResponse(columns: KanbanColumn[]): KanbanViewResponse {
  return {
    columns: columns.map((column) => ({
      status: column.status,
      tasks: column.tasks.map(toTaskResponse),
    })),
  };
}
