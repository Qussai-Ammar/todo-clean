import { Request, Response } from "express";
import { LoginUserUseCase } from "../application/login-user.usecase";
import { RegisterUserUseCase } from "../application/register-user.usecase";
import { LoginDto, RegisterDto } from "./dtos";

export class AuthController {
  constructor(
    private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly loginUserUseCase: LoginUserUseCase
  ) {}

  register = async (req: Request, res: Response): Promise<void> => {
    const dto = req.body as RegisterDto;
    const result = await this.registerUserUseCase.execute(dto);
    res.status(201).json(result);
  };

  login = async (req: Request, res: Response): Promise<void> => {
    const dto = req.body as LoginDto;
    const result = await this.loginUserUseCase.execute(dto);
    res.status(200).json(result);
  };
}
