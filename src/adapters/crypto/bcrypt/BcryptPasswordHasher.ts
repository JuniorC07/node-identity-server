import { createHmac } from 'node:crypto';
import bcrypt from 'bcrypt';
import { IPasswordHasher } from '@/services/IPasswordHasher.js';

export class BcryptPasswordHasher implements IPasswordHasher {
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
