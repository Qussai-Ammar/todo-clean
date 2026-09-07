import { EntityId, generateId } from "../../../shared/domain/entity-id";
import { ConflictError, ForbiddenError, NotFoundError, ValidationError } from "../../../shared/domain/errors/app-error";
import { Membership } from "../domain/membership.entity";
import { MembershipRepository } from "../domain/membership.repository";
import { CollaboratorRole } from "../domain/role";
import { ProjectLookup } from "./ports/project-lookup";
import { UserLookup } from "./ports/user-lookup";

export interface InviteMemberInput {
  projectId: EntityId;
  email: string;
  role: CollaboratorRole;
}

export class InviteMemberUseCase {
  constructor(
    private readonly membershipRepository: MembershipRepository,
    private readonly projectLookup: ProjectLookup,
    private readonly userLookup: UserLookup
  ) {}

  async execute(inviterId: EntityId, input: InviteMemberInput): Promise<Membership> {
    const project = await this.projectLookup.findById(input.projectId);
    if (!project) {
      throw new NotFoundError("Project");
    }

    if (!project.isOwnedBy(inviterId)) {
      throw new ForbiddenError("Only the project owner can invite collaborators");
    }

    const invitee = await this.userLookup.findByEmail(input.email.trim().toLowerCase());
    if (!invitee) {
      throw new NotFoundError("User");
    }

    if (invitee.id === inviterId) {
      throw new ValidationError("The project owner is already a collaborator");
    }

    const existing = await this.membershipRepository.findByProjectAndUser(input.projectId, invitee.id);
    if (existing) {
      throw new ConflictError("This user is already a collaborator on the project");
    }

    const membership = Membership.create({
      id: generateId(),
      projectId: input.projectId,
      userId: invitee.id,
      role: input.role,
      invitedAt: new Date(),
    });

    await this.membershipRepository.save(membership);
    return membership;
  }
}
