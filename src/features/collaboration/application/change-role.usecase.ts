import { EntityId } from "../../../shared/domain/entity-id";
import { ForbiddenError, NotFoundError } from "../../../shared/domain/errors/app-error";
import { Membership } from "../domain/membership.entity";
import { MembershipRepository } from "../domain/membership.repository";
import { CollaboratorRole } from "../domain/role";
import { ProjectLookup } from "./ports/project-lookup";

export class ChangeRoleUseCase {
  constructor(
    private readonly membershipRepository: MembershipRepository,
    private readonly projectLookup: ProjectLookup
  ) {}

  async execute(
    actingUserId: EntityId,
    projectId: EntityId,
    memberUserId: EntityId,
    role: CollaboratorRole
  ): Promise<Membership> {
    const project = await this.projectLookup.findById(projectId);
    if (!project) {
      throw new NotFoundError("Project");
    }

    if (!project.isOwnedBy(actingUserId)) {
      throw new ForbiddenError("Only the project owner can change collaborator roles");
    }

    const membership = await this.membershipRepository.findByProjectAndUser(projectId, memberUserId);
    if (!membership) {
      throw new NotFoundError("Membership");
    }

    membership.changeRole(role);
    await this.membershipRepository.save(membership);
    return membership;
  }
}
