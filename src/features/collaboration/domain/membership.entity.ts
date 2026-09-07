import { EntityId } from "../../../shared/domain/entity-id";
import { CollaboratorRole } from "./role";

export interface MembershipProps {
  id: EntityId;
  projectId: EntityId;
  userId: EntityId;
  role: CollaboratorRole;
  invitedAt: Date;
}

export class Membership {
  private constructor(private props: MembershipProps) {}

  static create(props: MembershipProps): Membership {
    return new Membership(props);
  }

  get id(): EntityId {
    return this.props.id;
  }

  get projectId(): EntityId {
    return this.props.projectId;
  }

  get userId(): EntityId {
    return this.props.userId;
  }

  get role(): CollaboratorRole {
    return this.props.role;
  }

  get invitedAt(): Date {
    return this.props.invitedAt;
  }

  changeRole(role: CollaboratorRole): void {
    this.props.role = role;
  }

  canEdit(): boolean {
    return this.props.role === "editor";
  }

  toJSON(): MembershipProps {
    return { ...this.props };
  }
}
