import { Request, Response } from "express";
import { CreateTaskUseCase } from "../application/create-task.usecase";
import { DeleteTaskUseCase } from "../application/delete-task.usecase";
import { ListTasksUseCase } from "../application/list-tasks.usecase";
import { MoveTaskUseCase } from "../application/move-task.usecase";
import { UpdateTaskUseCase } from "../application/update-task.usecase";
import { CreateTaskDto, MoveTaskDto, UpdateTaskDto } from "./dtos";
import { toTaskResponse } from "./task.presenter";

export class TaskController {
  constructor(
    private readonly createTaskUseCase: CreateTaskUseCase,
    private readonly listTasksUseCase: ListTasksUseCase,
    private readonly updateTaskUseCase: UpdateTaskUseCase,
    private readonly moveTaskUseCase: MoveTaskUseCase,
    private readonly deleteTaskUseCase: DeleteTaskUseCase
  ) {}

  create = async (req: Request, res: Response): Promise<void> => {
    const dto = req.body as CreateTaskDto;
    const task = await this.createTaskUseCase.execute(req.user!.userId, dto);
    res.status(201).json(toTaskResponse(task));
  };

  listByProject = async (req: Request, res: Response): Promise<void> => {
    const tasks = await this.listTasksUseCase.execute(req.user!.userId, req.params.projectId);
    res.status(200).json(tasks.map(toTaskResponse));
  };

  update = async (req: Request, res: Response): Promise<void> => {
    const dto = req.body as UpdateTaskDto;
    const task = await this.updateTaskUseCase.execute(req.user!.userId, req.params.taskId, dto);
    res.status(200).json(toTaskResponse(task));
  };

  move = async (req: Request, res: Response): Promise<void> => {
    const dto = req.body as MoveTaskDto;
    const task = await this.moveTaskUseCase.execute(req.user!.userId, req.params.taskId, dto);
    res.status(200).json(toTaskResponse(task));
  };

  remove = async (req: Request, res: Response): Promise<void> => {
    await this.deleteTaskUseCase.execute(req.user!.userId, req.params.taskId);
    res.status(204).send();
  };
}
