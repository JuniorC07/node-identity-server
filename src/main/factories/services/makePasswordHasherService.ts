import { IPasswordHasherService } from '@/services/IPasswordHasherService.js';
import { BcryptPasswordHasherService } from '@/adapters/crypto/bcrypt/BcryptPasswordHasherService.js';

export function makePasswordHasherService(): IPasswordHasherService {
  const rounds = process.env.NODE_ENV === 'development' ? 1 : 14;
  const passwordPepper = process.env.PASSWORD_PEPPER ?? '';

  return new BcryptPasswordHasherService(passwordPepper, rounds);
}
