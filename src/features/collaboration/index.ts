import { RequestHandler, Router } from "express";
import { ChangeRoleUseCase } from "./application/change-role.usecase";
import { InviteMemberUseCase } from "./application/invite-member.usecase";
import { ListMembersUseCase } from "./application/list-members.usecase";
import { RemoveMemberUseCase } from "./application/remove-member.usecase";
import { ProjectLookup } from "./application/ports/project-lookup";
import { UserLookup } from "./application/ports/user-lookup";
import { MembershipRepository } from "./domain/membership.repository";
import { InMemoryMembershipRepository } from "./infrastructure/in-memory-membership.repository";
import { CollaborationController } from "./presentation/collaboration.controller";
import { createCollaborationRoutes } from "./presentation/collaboration.routes";

export interface CollaborationModuleDeps {
  membershipRepository: MembershipRepository;
  projectLookup: ProjectLookup;
  userLookup: UserLookup;
  requireAuth: RequestHandler;
}

export interface CollaborationModule {
  routes: Router;
}

export function createMembershipRepository(): MembershipRepository {
  return new InMemoryMembershipRepository();
}

export function createCollaborationModule(deps: CollaborationModuleDeps): CollaborationModule {
  const { membershipRepository, projectLookup, userLookup, requireAuth } = deps;

  const inviteMemberUseCase = new InviteMemberUseCase(membershipRepository, projectLookup, userLookup);
  const listMembersUseCase = new ListMembersUseCase(membershipRepository, projectLookup);
  const changeRoleUseCase = new ChangeRoleUseCase(membershipRepository, projectLookup);
  const removeMemberUseCase = new RemoveMemberUseCase(membershipRepository, projectLookup);

  const controller = new CollaborationController(
    inviteMemberUseCase,
    listMembersUseCase,
    changeRoleUseCase,
    removeMemberUseCase
  );

  const routes = createCollaborationRoutes(controller, requireAuth);

  return { routes };
}

export type { Membership } from "./domain/membership.entity";
export type { MembershipRepository } from "./domain/membership.repository";
export type { CollaboratorRole } from "./domain/role";
