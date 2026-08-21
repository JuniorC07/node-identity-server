export interface TokenSigningKey {
  id: string;
  algorithm: 'RS256';
  privateKey: CryptoKey;
}

export interface TokenVerificationKey {
  id: string;
  algorithm: 'RS256';
  publicKey: CryptoKey;
}

export interface ITokenKeyStoreService {
  getSigningKey(): Promise<TokenSigningKey>;
  findVerificationKey(keyId: string): Promise<TokenVerificationKey | null>;
}
