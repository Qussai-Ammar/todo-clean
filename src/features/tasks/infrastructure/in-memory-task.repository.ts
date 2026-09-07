import { EntityId } from "../../../shared/domain/entity-id";
import { Task } from "../domain/task.entity";
import { TaskStatus } from "../domain/task-status";
import { TaskRepository } from "../domain/task.repository";

export class InMemoryTaskRepository implements TaskRepository {
  private readonly tasksById = new Map<EntityId, Task>();

  async findById(id: EntityId): Promise<Task | null> {
    return this.tasksById.get(id) ?? null;
  }

  async findByProject(projectId: EntityId): Promise<Task[]> {
    return [...this.tasksById.values()].filter((task) => task.projectId === projectId);
  }

  async countByProjectAndStatus(projectId: EntityId, status: TaskStatus): Promise<number> {
    return (await this.findByProject(projectId)).filter((task) => task.status === status).length;
  }

  async save(task: Task): Promise<void> {
    this.tasksById.set(task.id, task);
  }

  async delete(id: EntityId): Promise<void> {
    this.tasksById.delete(id);
  }
}
