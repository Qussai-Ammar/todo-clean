import { DialogManager } from "../../shared/dialog.js";
import { HttpClient } from "../../shared/http-client.js";
import { ToastManager } from "../../shared/toast.js";
import { CreateProjectUseCase } from "./application/create-project.usecase.js";
import { DeleteProjectUseCase } from "./application/delete-project.usecase.js";
import { GetProjectUseCase } from "./application/get-project.usecase.js";
import { ListProjectsUseCase } from "./application/list-projects.usecase.js";
import { UpdateProjectUseCase } from "./application/update-project.usecase.js";
import { HttpProjectsApi } from "./infrastructure/http-projects-api.js";
import { ProjectsController } from "./presentation/projects.controller.js";

export interface ProjectsFeature {
  controller: ProjectsController;
  getProjectUseCase: GetProjectUseCase;
}

export function createProjectsFeature(deps: {
  http: HttpClient;
  toast: ToastManager;
  dialogs: DialogManager;
  navigateToProject: (id: string) => void;
}): ProjectsFeature {
  const projectsApi = new HttpProjectsApi(deps.http);

  const listProjectsUseCase = new ListProjectsUseCase(projectsApi);
  const createProjectUseCase = new CreateProjectUseCase(projectsApi);
  const getProjectUseCase = new GetProjectUseCase(projectsApi);
  const updateProjectUseCase = new UpdateProjectUseCase(projectsApi);
  const deleteProjectUseCase = new DeleteProjectUseCase(projectsApi);

  const controller = new ProjectsController(
    listProjectsUseCase,
    createProjectUseCase,
    updateProjectUseCase,
    deleteProjectUseCase,
    deps.toast,
    deps.dialogs,
    deps.navigateToProject
  );

  return { controller, getProjectUseCase };
}

export type { Project } from "./domain/project.js";
export { GetProjectUseCase } from "./application/get-project.usecase.js";
export { ProjectsController } from "./presentation/projects.controller.js";
