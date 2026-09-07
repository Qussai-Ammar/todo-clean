const MAX_ATTEMPTS = 5;

export interface OtpCodeProps {
  email: string;
  codeHash: string;
  expiresAt: Date;
  attempts: number;
  lastSentAt: Date;
}

export class OtpCode {
  private constructor(private props: OtpCodeProps) {}

  static issue(email: string, codeHash: string, expiresAt: Date, now: Date): OtpCode {
    return new OtpCode({ email, codeHash, expiresAt, attempts: 0, lastSentAt: now });
  }

  get email(): string {
    return this.props.email;
  }

  get codeHash(): string {
    return this.props.codeHash;
  }

  get lastSentAt(): Date {
    return this.props.lastSentAt;
  }

  isExpired(now: Date): boolean {
    return now.getTime() > this.props.expiresAt.getTime();
  }

  hasTooManyAttempts(): boolean {
    return this.props.attempts >= MAX_ATTEMPTS;
  }

  registerFailedAttempt(): void {
    this.props.attempts += 1;
  }

  secondsUntilResendAllowed(now: Date, cooldownSeconds: number): number {
    const elapsed = (now.getTime() - this.props.lastSentAt.getTime()) / 1000;
    return Math.max(0, Math.ceil(cooldownSeconds - elapsed));
  }
}
