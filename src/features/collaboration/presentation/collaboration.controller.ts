import { Request, Response } from "express";
import { ChangeRoleUseCase } from "../application/change-role.usecase";
import { InviteMemberUseCase } from "../application/invite-member.usecase";
import { ListMembersUseCase } from "../application/list-members.usecase";
import { RemoveMemberUseCase } from "../application/remove-member.usecase";
import { ChangeRoleDto, InviteMemberDto } from "./dtos";
import { toMembershipResponse } from "./membership.presenter";

export class CollaborationController {
  constructor(
    private readonly inviteMemberUseCase: InviteMemberUseCase,
    private readonly listMembersUseCase: ListMembersUseCase,
    private readonly changeRoleUseCase: ChangeRoleUseCase,
    private readonly removeMemberUseCase: RemoveMemberUseCase
  ) {}

  invite = async (req: Request, res: Response): Promise<void> => {
    const dto = req.body as InviteMemberDto;
    const membership = await this.inviteMemberUseCase.execute(req.user!.userId, {
      projectId: req.params.projectId,
      email: dto.email,
      role: dto.role,
    });
    res.status(201).json(toMembershipResponse(membership));
  };

  list = async (req: Request, res: Response): Promise<void> => {
    const members = await this.listMembersUseCase.execute(req.user!.userId, req.params.projectId);
    res.status(200).json(members.map(toMembershipResponse));
  };

  changeRole = async (req: Request, res: Response): Promise<void> => {
    const dto = req.body as ChangeRoleDto;
    const membership = await this.changeRoleUseCase.execute(
      req.user!.userId,
      req.params.projectId,
      req.params.userId,
      dto.role
    );
    res.status(200).json(toMembershipResponse(membership));
  };

  remove = async (req: Request, res: Response): Promise<void> => {
    await this.removeMemberUseCase.execute(req.user!.userId, req.params.projectId, req.params.userId);
    res.status(204).send();
  };
}
