export interface SignTokenInput {
  subject: string;
  sessionId: string;
  clientId: string;
  scopes: string[];
  modules: string[];
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
