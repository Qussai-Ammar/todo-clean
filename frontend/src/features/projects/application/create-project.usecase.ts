import { Project } from "../domain/project.js";
import { CreateProjectInput, ProjectsApi } from "./ports/projects-api.js";

export class CreateProjectUseCase {
  constructor(private readonly projectsApi: ProjectsApi) {}

  execute(input: CreateProjectInput): Promise<Project> {
    return this.projectsApi.create(input);
  }
}
