import { EntityId } from "../../../shared/domain/entity-id";

export interface ProjectProps {
  id: EntityId;
  name: string;
  description: string;
  ownerId: EntityId;
  createdAt: Date;
  updatedAt: Date;
}

export class Project {
  private constructor(private props: ProjectProps) {}

  static create(props: ProjectProps): Project {
    return new Project(props);
  }

  get id(): EntityId {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get description(): string {
    return this.props.description;
  }

  get ownerId(): EntityId {
    return this.props.ownerId;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  rename(name: string): void {
    this.props.name = name;
    this.props.updatedAt = new Date();
  }

  updateDescription(description: string): void {
    this.props.description = description;
    this.props.updatedAt = new Date();
  }

  isOwnedBy(userId: EntityId): boolean {
    return this.props.ownerId === userId;
  }

  toJSON(): ProjectProps {
    return { ...this.props };
  }
}
