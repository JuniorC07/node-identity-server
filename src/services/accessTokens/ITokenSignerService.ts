export interface SignTokenInput {
  subject: string;
  sessionId: string;
  audience: string | string[];
  expiresInSeconds: number;
}
export interface SignTokenOutput {
  token: string;
  issuedAt: Date;
  expiresAt: Date;
}

export interface ITokenSignerService {
  sign(input: SignTokenInput): Promise<SignTokenOutput>;
}
