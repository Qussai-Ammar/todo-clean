import { Membership } from "../domain/membership.entity";

export interface MembershipResponse {
  id: string;
  projectId: string;
  userId: string;
  role: string;
  invitedAt: string;
}

export function toMembershipResponse(membership: Membership): MembershipResponse {
  const props = membership.toJSON();
  return {
    id: props.id,
    projectId: props.projectId,
    userId: props.userId,
    role: props.role,
    invitedAt: props.invitedAt.toISOString(),
  };
}
