import { EntityId } from "../../../shared/domain/entity-id";
import { ForbiddenError, NotFoundError } from "../../../shared/domain/errors/app-error";
import { Membership } from "../domain/membership.entity";
import { MembershipRepository } from "../domain/membership.repository";
import { ProjectLookup } from "./ports/project-lookup";

export class ListMembersUseCase {
  constructor(
    private readonly membershipRepository: MembershipRepository,
    private readonly projectLookup: ProjectLookup
  ) {}

  async execute(userId: EntityId, projectId: EntityId): Promise<Membership[]> {
    const project = await this.projectLookup.findById(projectId);
    if (!project) {
      throw new NotFoundError("Project");
    }

    if (!project.isOwnedBy(userId)) {
      const membership = await this.membershipRepository.findByProjectAndUser(projectId, userId);
      if (!membership) {
        throw new ForbiddenError("You do not have access to this project");
      }
    }

    return this.membershipRepository.findByProject(projectId);
  }
}
