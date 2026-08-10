export interface SignIdTokenInput {
  subject: string;
  audience: string;
  sessionId: string;
  nonce: string | null;
  claims: Record<string, string>;
  expiresInSeconds: number;
}

export interface SignIdTokenOutput {
  token: string;
  issuedAt: Date;
  expiresAt: Date;
}

export interface IIdTokenSignerService {
  sign(input: SignIdTokenInput): Promise<SignIdTokenOutput>;
}
