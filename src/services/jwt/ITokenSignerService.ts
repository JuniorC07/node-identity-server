export interface SignTokenInput {
  subject: string;
  audience: string | string[];
  expiresInSeconds: number;
  typ: string;
  claims?: Record<string, unknown>;
}
export interface SignTokenOutput {
  token: string;
  issuedAt: Date;
  expiresAt: Date;
}

export interface ITokenSignerService {
  sign(input: SignTokenInput): Promise<SignTokenOutput>;
}
