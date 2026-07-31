import { createHmac } from 'node:crypto';
import bcrypt from 'bcrypt';
import { IPasswordHasherService } from '@/services/IPasswordHasherService.js';

export class BcryptPasswordHasherService implements IPasswordHasherService {
  constructor(
    private readonly pepper = '',
    private readonly rounds = 12
  ) {}

  private applyPepper(password: string): string {
    return this.pepper
      ? createHmac('sha256', this.pepper).update(password, 'utf8').digest('hex')
      : password;
  }

  async hash(password: string): Promise<string> {
    const pepperedPassword = this.applyPepper(password);

    return bcrypt.hash(pepperedPassword, this.rounds);
  }

  async verify(password: string, hash: string): Promise<boolean> {
    const pepperedPassword = this.applyPepper(password);

    return bcrypt.compare(pepperedPassword, hash);
  }
}
