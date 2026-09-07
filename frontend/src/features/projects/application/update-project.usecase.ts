import { Project } from "../domain/project.js";
import { ProjectsApi, UpdateProjectInput } from "./ports/projects-api.js";

export class UpdateProjectUseCase {
  constructor(private readonly projectsApi: ProjectsApi) {}

  execute(id: string, input: UpdateProjectInput): Promise<Project> {
    return this.projectsApi.update(id, input);
  }
}
