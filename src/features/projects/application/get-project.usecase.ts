import { EntityId } from "../../../shared/domain/entity-id";
import { NotFoundError } from "../../../shared/domain/errors/app-error";
import { ProjectAccessPolicy } from "../../../shared/application/ports/project-access-policy";
import { Project } from "../domain/project.entity";
import { ProjectRepository } from "../domain/project.repository";

export class GetProjectUseCase {
  constructor(
    private readonly projectRepository: ProjectRepository,
    private readonly accessPolicy: ProjectAccessPolicy
  ) {}

  async execute(userId: EntityId, projectId: EntityId): Promise<Project> {
    await this.accessPolicy.assertCanView(userId, projectId);

    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new NotFoundError("Project");
    }
    return project;
  }
}
