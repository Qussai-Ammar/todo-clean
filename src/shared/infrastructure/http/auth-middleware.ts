import { NextFunction, Request, Response } from "express";
import { UnauthorizedError } from "../../domain/errors/app-error";
import { EntityId } from "../../domain/entity-id";

export interface AuthenticatedUser {
  userId: EntityId;
  email: string;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export type TokenVerifier = (token: string) => AuthenticatedUser;

export function createAuthMiddleware(verifyToken: TokenVerifier) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      throw new UnauthorizedError("Missing bearer token");
    }

    const token = header.slice("Bearer ".length);
    try {
      req.user = verifyToken(token);
      next();
    } catch {
      throw new UnauthorizedError("Invalid or expired token");
    }
  };
}
