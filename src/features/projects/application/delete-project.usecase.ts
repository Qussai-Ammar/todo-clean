import { EntityId } from "../../../shared/domain/entity-id";
import { ForbiddenError, NotFoundError } from "../../../shared/domain/errors/app-error";
import { ProjectRepository } from "../domain/project.repository";

export class DeleteProjectUseCase {
  constructor(private readonly projectRepository: ProjectRepository) {}

  async execute(userId: EntityId, projectId: EntityId): Promise<void> {
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new NotFoundError("Project");
    }

    if (!project.isOwnedBy(userId)) {
      throw new ForbiddenError("Only the project owner can delete this project");
    }

    await this.projectRepository.delete(projectId);
  }
}
