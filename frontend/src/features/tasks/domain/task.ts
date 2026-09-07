export type TaskStatus = "todo" | "in_progress" | "done";

export const TASK_STATUSES: TaskStatus[] = ["todo", "in_progress", "done"];

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "To do",
  in_progress: "In progress",
  done: "Done",
};

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: TaskStatus;
  position: number;
  assigneeId: string | null;
  createdAt: string;
  updatedAt: string;
}
