import { Request, Response } from "express";
import { LoginUserUseCase } from "../application/login-user.usecase";
import { RegisterUserUseCase } from "../application/register-user.usecase";
import { ResendOtpUseCase } from "../application/resend-otp.usecase";
import { VerifyOtpUseCase } from "../application/verify-otp.usecase";
import { LoginDto, RegisterDto, ResendOtpDto, VerifyOtpDto } from "./dtos";

export class AuthController {
  constructor(
    private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly loginUserUseCase: LoginUserUseCase,
    private readonly verifyOtpUseCase: VerifyOtpUseCase,
    private readonly resendOtpUseCase: ResendOtpUseCase
  ) {}

  register = async (req: Request, res: Response): Promise<void> => {
    const dto = req.body as RegisterDto;
    const result = await this.registerUserUseCase.execute(dto);
    res.status(202).json(result);
  };

  verifyOtp = async (req: Request, res: Response): Promise<void> => {
    const dto = req.body as VerifyOtpDto;
    const result = await this.verifyOtpUseCase.execute(dto);
    res.status(200).json(result);
  };

  resendOtp = async (req: Request, res: Response): Promise<void> => {
    const dto = req.body as ResendOtpDto;
    const result = await this.resendOtpUseCase.execute(dto.email);
    res.status(200).json(result);
  };

  login = async (req: Request, res: Response): Promise<void> => {
    const dto = req.body as LoginDto;
    const result = await this.loginUserUseCase.execute(dto);
    res.status(200).json(result);
  };
}
