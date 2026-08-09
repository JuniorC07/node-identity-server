import { createHash } from 'node:crypto';

import type { IPkceService } from '@/services/IPkceService.js';

const CODE_CHALLENGE_PATTERN = /^[A-Za-z0-9_-]{43}$/;
const CODE_VERIFIER_PATTERN = /^[A-Za-z0-9._~-]{43,128}$/;

export class S256PkceService implements IPkceService {
  isValidChallenge(codeChallenge: string): boolean {
    return CODE_CHALLENGE_PATTERN.test(codeChallenge);
  }

  isValidVerifier(codeVerifier: string): boolean {
    return CODE_VERIFIER_PATTERN.test(codeVerifier);
  }

  createChallenge(codeVerifier: string): string {
    return createHash('sha256').update(codeVerifier, 'ascii').digest('base64url');
  }
}
