import jwt from "jsonwebtoken";
import { AuthTokenPayload, TokenService } from "../application/ports/token-service";

export class JwtTokenService implements TokenService {
  constructor(
    private readonly secret: string,
    private readonly expiresIn: string = "7d"
  ) {}

  sign(payload: AuthTokenPayload): string {
    return jwt.sign(payload, this.secret, { expiresIn: this.expiresIn } as jwt.SignOptions);
  }

  verify(token: string): AuthTokenPayload {
    const decoded = jwt.verify(token, this.secret) as AuthTokenPayload;
    return { userId: decoded.userId, email: decoded.email };
  }
}
