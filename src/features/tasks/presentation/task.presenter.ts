import { Task } from "../domain/task.entity";

export interface TaskResponse {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: string;
  position: number;
  assigneeId: string | null;
  createdAt: string;
  updatedAt: string;
}

export function toTaskResponse(task: Task): TaskResponse {
  const props = task.toJSON();
  return {
    id: props.id,
    projectId: props.projectId,
    title: props.title,
    description: props.description,
    status: props.status,
    position: props.position,
    assigneeId: props.assigneeId,
    createdAt: props.createdAt.toISOString(),
    updatedAt: props.updatedAt.toISOString(),
  };
}
