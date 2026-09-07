import { EntityId } from "../../../shared/domain/entity-id";
import { NotFoundError, ValidationError } from "../../../shared/domain/errors/app-error";
import { ProjectAccessPolicy } from "../../../shared/application/ports/project-access-policy";
import { Project } from "../domain/project.entity";
import { ProjectRepository } from "../domain/project.repository";

export interface UpdateProjectInput {
  name?: string;
  description?: string;
}

export class UpdateProjectUseCase {
  constructor(
    private readonly projectRepository: ProjectRepository,
    private readonly accessPolicy: ProjectAccessPolicy
  ) {}

  async execute(userId: EntityId, projectId: EntityId, input: UpdateProjectInput): Promise<Project> {
    await this.accessPolicy.assertCanEdit(userId, projectId);

    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new NotFoundError("Project");
    }

    if (input.name !== undefined) {
      const name = input.name.trim();
      if (!name) {
        throw new ValidationError("Project name cannot be empty");
      }
      project.rename(name);
    }

    if (input.description !== undefined) {
      project.updateDescription(input.description.trim());
    }

    await this.projectRepository.save(project);
    return project;
  }
}
