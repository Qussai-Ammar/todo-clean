import { Request, Response } from "express";
import { GetKanbanViewUseCase } from "../application/get-kanban-view.usecase";
import { GetListViewUseCase } from "../application/get-list-view.usecase";
import { toKanbanViewResponse, toListViewResponse } from "./view.presenter";

export class ViewController {
  constructor(
    private readonly getListViewUseCase: GetListViewUseCase,
    private readonly getKanbanViewUseCase: GetKanbanViewUseCase
  ) {}

  list = async (req: Request, res: Response): Promise<void> => {
    const tasks = await this.getListViewUseCase.execute(req.user!.userId, req.params.projectId);
    res.status(200).json(toListViewResponse(tasks));
  };

  kanban = async (req: Request, res: Response): Promise<void> => {
    const columns = await this.getKanbanViewUseCase.execute(req.user!.userId, req.params.projectId);
    res.status(200).json(toKanbanViewResponse(columns));
  };
}
