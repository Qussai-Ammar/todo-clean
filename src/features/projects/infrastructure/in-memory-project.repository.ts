import { EntityId } from "../../../shared/domain/entity-id";
import { Project } from "../domain/project.entity";
import { ProjectRepository } from "../domain/project.repository";

export class InMemoryProjectRepository implements ProjectRepository {
  private readonly projectsById = new Map<EntityId, Project>();

  async findById(id: EntityId): Promise<Project | null> {
    return this.projectsById.get(id) ?? null;
  }

  async findByOwner(ownerId: EntityId): Promise<Project[]> {
    return [...this.projectsById.values()].filter((project) => project.isOwnedBy(ownerId));
  }

  async save(project: Project): Promise<void> {
    this.projectsById.set(project.id, project);
  }

  async delete(id: EntityId): Promise<void> {
    this.projectsById.delete(id);
  }
}
