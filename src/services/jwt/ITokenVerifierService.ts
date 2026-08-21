export interface VerifyTokenInput {
  token: string;
  audience: string | string[];
  expectedTyp: string;
}

export interface VerifyTokenOutput {
  issuer: string;
  subject: string;
  audience: string[];
  issuedAt: Date;
  expiresAt: Date;
  claims: Record<string, unknown>;
}

export interface ITokenVerifierService {
  verify(input: VerifyTokenInput): Promise<VerifyTokenOutput>;
}
