import { ProjectsApi } from "./ports/projects-api.js";

export class DeleteProjectUseCase {
  constructor(private readonly projectsApi: ProjectsApi) {}

  execute(id: string): Promise<void> {
    return this.projectsApi.remove(id);
  }
}
