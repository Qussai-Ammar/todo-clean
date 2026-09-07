import { EntityId } from "../../../shared/domain/entity-id";

export interface UserProps {
  id: EntityId;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
}

export class User {
  private constructor(private readonly props: UserProps) {}

  static create(props: UserProps): User {
    return new User(props);
  }

  get id(): EntityId {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get email(): string {
    return this.props.email;
  }

  get passwordHash(): string {
    return this.props.passwordHash;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  toPublic(): { id: EntityId; name: string; email: string; createdAt: Date } {
    return { id: this.props.id, name: this.props.name, email: this.props.email, createdAt: this.props.createdAt };
  }
}
