import { EntityId, generateId } from "../../../shared/domain/entity-id";
import { ValidationError } from "../../../shared/domain/errors/app-error";
import { ProjectAccessPolicy } from "../../../shared/application/ports/project-access-policy";
import { Task } from "../domain/task.entity";
import { TaskRepository } from "../domain/task.repository";

export interface CreateTaskInput {
  projectId: EntityId;
  title: string;
  description?: string;
  assigneeId?: EntityId | null;
}

export class CreateTaskUseCase {
  constructor(
    private readonly taskRepository: TaskRepository,
    private readonly accessPolicy: ProjectAccessPolicy
  ) {}

  async execute(userId: EntityId, input: CreateTaskInput): Promise<Task> {
    await this.accessPolicy.assertCanEdit(userId, input.projectId);

    const title = input.title.trim();
    if (!title) {
      throw new ValidationError("Task title is required");
    }

    const position = await this.taskRepository.countByProjectAndStatus(input.projectId, "todo");
    const now = new Date();

    const task = Task.create({
      id: generateId(),
      projectId: input.projectId,
      title,
      description: input.description?.trim() ?? "",
      status: "todo",
      position,
      assigneeId: input.assigneeId ?? null,
      createdAt: now,
      updatedAt: now,
    });

    await this.taskRepository.save(task);
    return task;
  }
}
