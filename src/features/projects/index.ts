import { RequestHandler, Router } from "express";
import { ProjectAccessPolicy } from "../../shared/application/ports/project-access-policy";
import { CreateProjectUseCase } from "./application/create-project.usecase";
import { DeleteProjectUseCase } from "./application/delete-project.usecase";
import { GetProjectUseCase } from "./application/get-project.usecase";
import { ListAccessibleProjectsUseCase } from "./application/list-accessible-projects.usecase";
import { UpdateProjectUseCase } from "./application/update-project.usecase";
import { ProjectMembershipProvider } from "./application/ports/project-membership-provider";
import { ProjectRepository } from "./domain/project.repository";
import { InMemoryProjectRepository } from "./infrastructure/in-memory-project.repository";
import { ProjectController } from "./presentation/project.controller";
import { createProjectRoutes } from "./presentation/project.routes";

export interface ProjectsModuleDeps {
  projectRepository: ProjectRepository;
  accessPolicy: ProjectAccessPolicy;
  membershipProvider: ProjectMembershipProvider;
  requireAuth: RequestHandler;
}

export interface ProjectsModule {
  routes: Router;
}

export function createProjectRepository(): ProjectRepository {
  return new InMemoryProjectRepository();
}

export function createProjectsModule(deps: ProjectsModuleDeps): ProjectsModule {
  const { projectRepository, accessPolicy, membershipProvider, requireAuth } = deps;

  const createProjectUseCase = new CreateProjectUseCase(projectRepository);
  const listAccessibleProjectsUseCase = new ListAccessibleProjectsUseCase(projectRepository, membershipProvider);
  const getProjectUseCase = new GetProjectUseCase(projectRepository, accessPolicy);
  const updateProjectUseCase = new UpdateProjectUseCase(projectRepository, accessPolicy);
  const deleteProjectUseCase = new DeleteProjectUseCase(projectRepository);

  const controller = new ProjectController(
    createProjectUseCase,
    listAccessibleProjectsUseCase,
    getProjectUseCase,
    updateProjectUseCase,
    deleteProjectUseCase
  );

  const routes = createProjectRoutes(controller, requireAuth);

  return { routes };
}

export type { Project } from "./domain/project.entity";
export type { ProjectRepository } from "./domain/project.repository";
