import { EntityId } from "../shared/domain/entity-id";
import { ForbiddenError, NotFoundError } from "../shared/domain/errors/app-error";
import { ProjectAccessPolicy } from "../shared/application/ports/project-access-policy";
import { ProjectRepository } from "../features/projects";
import { MembershipRepository } from "../features/collaboration";

/**
 * Glues the projects and collaboration features together: a project is
 * visible to its owner and to any invited collaborator, but only the owner
 * or an "editor" collaborator may modify it. This class is the one place in
 * the codebase that is allowed to know about both features' repositories.
 */
export class InMemoryProjectAccessPolicy implements ProjectAccessPolicy {
  constructor(
    private readonly projectRepository: ProjectRepository,
    private readonly membershipRepository: MembershipRepository
  ) {}

  async assertCanView(userId: EntityId, projectId: EntityId): Promise<void> {
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new NotFoundError("Project");
    }

    if (project.isOwnedBy(userId)) {
      return;
    }

    const membership = await this.membershipRepository.findByProjectAndUser(projectId, userId);
    if (!membership) {
      throw new ForbiddenError("You do not have access to this project");
    }
  }

  async assertCanEdit(userId: EntityId, projectId: EntityId): Promise<void> {
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new NotFoundError("Project");
    }

    if (project.isOwnedBy(userId)) {
      return;
    }

    const membership = await this.membershipRepository.findByProjectAndUser(projectId, userId);
    if (!membership || !membership.canEdit()) {
      throw new ForbiddenError("You do not have permission to edit this project");
    }
  }
}
