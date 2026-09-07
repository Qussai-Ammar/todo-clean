import { EntityId } from "../../../shared/domain/entity-id";
import { Project } from "../domain/project.entity";
import { ProjectRepository } from "../domain/project.repository";
import { ProjectMembershipProvider } from "./ports/project-membership-provider";

export class ListAccessibleProjectsUseCase {
  constructor(
    private readonly projectRepository: ProjectRepository,
    private readonly membershipProvider: ProjectMembershipProvider
  ) {}

  async execute(userId: EntityId): Promise<Project[]> {
    const owned = await this.projectRepository.findByOwner(userId);
    const memberProjectIds = await this.membershipProvider.listProjectIdsForUser(userId);

    const ownedIds = new Set(owned.map((project) => project.id));
    const shared = await Promise.all(
      memberProjectIds
        .filter((id) => !ownedIds.has(id))
        .map((id) => this.projectRepository.findById(id))
    );

    return [...owned, ...shared.filter((p): p is Project => p !== null)];
  }
}
