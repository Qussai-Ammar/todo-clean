import { generateId } from "../../../shared/domain/entity-id";
import { ValidationError } from "../../../shared/domain/errors/app-error";
import { Project } from "../domain/project.entity";
import { ProjectRepository } from "../domain/project.repository";

export interface CreateProjectInput {
  ownerId: string;
  name: string;
  description?: string;
}

export class CreateProjectUseCase {
  constructor(private readonly projectRepository: ProjectRepository) {}

  async execute(input: CreateProjectInput): Promise<Project> {
    const name = input.name.trim();
    if (!name) {
      throw new ValidationError("Project name is required");
    }

    const now = new Date();
    const project = Project.create({
      id: generateId(),
      name,
      description: input.description?.trim() ?? "",
      ownerId: input.ownerId,
      createdAt: now,
      updatedAt: now,
    });

    await this.projectRepository.save(project);
    return project;
  }
}
