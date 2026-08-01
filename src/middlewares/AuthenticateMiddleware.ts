import { ValidateSessionUsecase } from '@/useCases/sessions/_internal/ValidateSessionUsecase.js';
import type { RequestHandler } from 'express';
import { UnauthorizedError } from '@/errors/general/UnauthorizedError.js';
import { sessionCookieConfig } from '@/config/sessionCookieConfig.js';
import { ICookieSerializerService } from '@/services/ICookieSerializerService.js';

export class AuthenticateMiddleware {
  constructor(
    private readonly ValidateSessionUsecase: ValidateSessionUsecase,
    private readonly cookieSerializerService: ICookieSerializerService
  ) {}

  handle(): RequestHandler {
    return async (req, _res, next) => {
      const cookies = this.cookieSerializerService.parse(req.headers?.cookie ?? '');
      const rawToken = cookies[sessionCookieConfig.name] ?? null;
      if (!rawToken) {
        throw new UnauthorizedError();
      }

      const session = await this.ValidateSessionUsecase.execute({ rawToken });

      req.auth = {
        sessionId: session.id,
        userId: session.userId,
        identityId: session.identityId,
      };

      next();
    };
  }
}
