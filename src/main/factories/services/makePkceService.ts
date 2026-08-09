import { S256PkceService } from '@/adapters/crypto/sha256/S256PkceService.js';
import type { IPkceService } from '@/services/IPkceService.js';

export function makePkceService(): IPkceService {
  return new S256PkceService();
}
