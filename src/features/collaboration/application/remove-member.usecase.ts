import { EntityId } from "../../../shared/domain/entity-id";
import { ForbiddenError, NotFoundError } from "../../../shared/domain/errors/app-error";
import { MembershipRepository } from "../domain/membership.repository";
import { ProjectLookup } from "./ports/project-lookup";

export class RemoveMemberUseCase {
  constructor(
    private readonly membershipRepository: MembershipRepository,
    private readonly projectLookup: ProjectLookup
  ) {}

  async execute(actingUserId: EntityId, projectId: EntityId, memberUserId: EntityId): Promise<void> {
    const project = await this.projectLookup.findById(projectId);
    if (!project) {
      throw new NotFoundError("Project");
    }

    const isOwner = project.isOwnedBy(actingUserId);
    const isSelfRemoval = actingUserId === memberUserId;

    if (!isOwner && !isSelfRemoval) {
      throw new ForbiddenError("Only the project owner can remove other collaborators");
    }

    const membership = await this.membershipRepository.findByProjectAndUser(projectId, memberUserId);
    if (!membership) {
      throw new NotFoundError("Membership");
    }

    await this.membershipRepository.delete(projectId, memberUserId);
  }
}
