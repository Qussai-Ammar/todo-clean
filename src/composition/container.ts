import { Router } from "express";
import { createAuthModule } from "../features/auth";
import { createCollaborationModule, createMembershipRepository } from "../features/collaboration";
import { createProjectRepository, createProjectsModule } from "../features/projects";
import { createTaskRepository, createTasksModule } from "../features/tasks";
import { createViewsModule } from "../features/views";
import { createAuthMiddleware } from "../shared/infrastructure/http/auth-middleware";
import { InMemoryProjectAccessPolicy } from "./project-access-policy";

export interface AppRoutes {
  auth: Router;
  projects: Router;
  tasks: Router;
  views: Router;
  collaboration: Router;
}

export function buildContainer(jwtSecret: string): AppRoutes {
  // Each feature owns and instantiates its own repositories; the
  // composition root only wires the cross-feature ports together.
  const auth = createAuthModule(jwtSecret);
  const requireAuth = createAuthMiddleware((token) => auth.tokenService.verify(token));

  const projectRepository = createProjectRepository();
  const membershipRepository = createMembershipRepository();
  const taskRepository = createTaskRepository();

  const accessPolicy = new InMemoryProjectAccessPolicy(projectRepository, membershipRepository);

  const projects = createProjectsModule({
    projectRepository,
    accessPolicy,
    membershipProvider: membershipRepository,
    requireAuth,
  });

  const tasks = createTasksModule({ taskRepository, accessPolicy, requireAuth });

  const views = createViewsModule({ taskReader: taskRepository, accessPolicy, requireAuth });

  const collaboration = createCollaborationModule({
    membershipRepository,
    projectLookup: projectRepository,
    userLookup: auth.userRepository,
    requireAuth,
  });

  return {
    auth: auth.routes,
    projects: projects.routes,
    tasks: tasks.routes,
    views: views.routes,
    collaboration: collaboration.routes,
  };
}
