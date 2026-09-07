import { Project } from "../domain/project.js";
import { ProjectsApi } from "./ports/projects-api.js";

export class GetProjectUseCase {
  constructor(private readonly projectsApi: ProjectsApi) {}

  execute(id: string): Promise<Project> {
    return this.projectsApi.get(id);
  }
}
