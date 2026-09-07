import { EntityId } from "../../../shared/domain/entity-id";
import { TaskStatus } from "./task-status";

export interface TaskProps {
  id: EntityId;
  projectId: EntityId;
  title: string;
  description: string;
  status: TaskStatus;
  position: number;
  assigneeId: EntityId | null;
  createdAt: Date;
  updatedAt: Date;
}

export class Task {
  private constructor(private props: TaskProps) {}

  static create(props: TaskProps): Task {
    return new Task(props);
  }

  get id(): EntityId {
    return this.props.id;
  }

  get projectId(): EntityId {
    return this.props.projectId;
  }

  get title(): string {
    return this.props.title;
  }

  get description(): string {
    return this.props.description;
  }

  get status(): TaskStatus {
    return this.props.status;
  }

  get position(): number {
    return this.props.position;
  }

  get assigneeId(): EntityId | null {
    return this.props.assigneeId;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  updateDetails(fields: { title?: string; description?: string; assigneeId?: EntityId | null }): void {
    if (fields.title !== undefined) this.props.title = fields.title;
    if (fields.description !== undefined) this.props.description = fields.description;
    if (fields.assigneeId !== undefined) this.props.assigneeId = fields.assigneeId;
    this.props.updatedAt = new Date();
  }

  moveTo(status: TaskStatus, position: number): void {
    this.props.status = status;
    this.props.position = position;
    this.props.updatedAt = new Date();
  }

  toJSON(): TaskProps {
    return { ...this.props };
  }
}
