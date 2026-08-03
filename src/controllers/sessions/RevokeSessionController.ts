import { sessionCookieConfig } from '@/config/sessionCookieConfig.js';
import { UnauthorizedError } from '@/errors/general/UnauthorizedError.js';
import { ICookieSerializerService } from '@/services/ICookieSerializerService.js';
import { RevokeSessionUseCase } from '@/useCases/sessions/RevokeSessionUseCase.js';
import { type Request, type Response } from 'express';

export class RevokeSessionController {
  constructor(
    private readonly revokeSessionUseCase: RevokeSessionUseCase,
    private readonly cookieSerializerService: ICookieSerializerService
  ) {}
  handle = async (req: Request, res: Response): Promise<void> => {
    if (!req.auth?.sessionId) {
      throw new UnauthorizedError();
    }
    await this.revokeSessionUseCase.execute(req.auth.sessionId);

    const sessionCookie = this.cookieSerializerService.serialize(sessionCookieConfig.name, '', {
      httpOnly: sessionCookieConfig.httpOnly,
      path: sessionCookieConfig.path,
      sameSite: sessionCookieConfig.sameSite,
      secure: sessionCookieConfig.secure,
      maxAge: 0,
    });
    res.setHeader('Set-Cookie', sessionCookie);
    res.status(204).end();
  };
}
