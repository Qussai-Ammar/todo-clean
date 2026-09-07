import { Project } from "../domain/project.js";
import { ProjectsApi } from "./ports/projects-api.js";

export class ListProjectsUseCase {
  constructor(private readonly projectsApi: ProjectsApi) {}

  execute(): Promise<Project[]> {
    return this.projectsApi.list();
  }
}
