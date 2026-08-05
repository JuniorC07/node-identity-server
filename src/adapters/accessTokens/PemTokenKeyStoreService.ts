import { importPKCS8, importSPKI } from 'jose';

import type {
  ITokenKeyStoreService,
  TokenSigningKey,
  TokenVerificationKey,
} from '@/services/accessTokens/ITokenKeyStoreService.js';

interface PemTokenKeyStoreConfig {
  keyId: string;
  algorithm: 'RS256';
  privateKeyPem: string;
  publicKeyPem: string;
}

export class PemTokenKeyStoreService implements ITokenKeyStoreService {
  private signingKeyPromise: Promise<TokenSigningKey> | null = null;
  private verificationKeyPromise: Promise<TokenVerificationKey> | null = null;

  constructor(private readonly config: PemTokenKeyStoreConfig) {}

  async getSigningKey(): Promise<TokenSigningKey> {
    this.signingKeyPromise ??= this.loadSigningKey();
    return this.signingKeyPromise;
  }

  async findVerificationKey(keyId: string): Promise<TokenVerificationKey | null> {
    if (keyId !== this.config.keyId) {
      return null;
    }

    this.verificationKeyPromise ??= this.loadVerificationKey();

    return this.verificationKeyPromise;
  }

  private async loadSigningKey(): Promise<TokenSigningKey> {
    const privateKey = await importPKCS8(this.config.privateKeyPem, this.config.algorithm);

    return {
      id: this.config.keyId,
      algorithm: this.config.algorithm,
      privateKey,
    };
  }

  private async loadVerificationKey(): Promise<TokenVerificationKey> {
    const publicKey = await importSPKI(this.config.publicKeyPem, this.config.algorithm);

    return {
      id: this.config.keyId,
      algorithm: this.config.algorithm,
      publicKey,
    };
  }
}
