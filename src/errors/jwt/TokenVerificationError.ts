export type TokenVerificationFailure =
  'expired' | 'invalid' | 'invalid_audience' | 'invalid_issuer' | 'invalid_key_id';

export class TokenVerificationError extends Error {
  constructor(public readonly failure: TokenVerificationFailure) {
    super('Token verification failed');
    this.name = TokenVerificationError.name;
  }
}
