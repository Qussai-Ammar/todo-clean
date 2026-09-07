import { EntityId } from "../../../shared/domain/entity-id";

export interface UserProps {
  id: EntityId;
  name: string;
  email: string;
  passwordHash: string;
  isVerified: boolean;
  createdAt: Date;
}

export class User {
  private constructor(private props: UserProps) {}

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

  get isVerified(): boolean {
    return this.props.isVerified;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  markVerified(): void {
    this.props.isVerified = true;
  }

  toPublic(): { id: EntityId; name: string; email: string; isVerified: boolean; createdAt: Date } {
    return {
      id: this.props.id,
      name: this.props.name,
      email: this.props.email,
      isVerified: this.props.isVerified,
      createdAt: this.props.createdAt,
    };
  }
}
