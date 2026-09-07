import { z } from "zod";
import { TASK_STATUSES } from "../domain/task-status";

export const createTaskSchema = z.object({
  projectId: z.string().min(1, "projectId is required"),
  title: z.string().min(1, "Task title is required"),
  description: z.string().optional(),
  assigneeId: z.string().nullable().optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  assigneeId: z.string().nullable().optional(),
});

export const moveTaskSchema = z.object({
  status: z.enum(TASK_STATUSES),
  position: z.number().int().min(0),
});

export type CreateTaskDto = z.infer<typeof createTaskSchema>;
export type UpdateTaskDto = z.infer<typeof updateTaskSchema>;
export type MoveTaskDto = z.infer<typeof moveTaskSchema>;
