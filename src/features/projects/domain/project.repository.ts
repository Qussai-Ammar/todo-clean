import { EntityId } from "../../../shared/domain/entity-id";
import { Project } from "./project.entity";

export interface ProjectRepository {
  findById(id: EntityId): Promise<Project | null>;
  findByOwner(ownerId: EntityId): Promise<Project[]>;
  save(project: Project): Promise<void>;
  delete(id: EntityId): Promise<void>;
}
