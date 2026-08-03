import { ValidateSessionUsecase } from '@/useCases/sessions/_internal/ValidateSessionUsecase.js';
import type { RequestHandler } from 'express';
import { UnauthorizedError } from '@/errors/general/UnauthorizedError.js';
import { sessionCookieConfig } from '@/config/sessionCookieConfig.js';
import { ICookieSerializerService } from '@/services/ICookieSerializerService.js';
import { UpdateSessionLastUsedAtUseCase } from '@/useCases/sessions/_internal/UpdateLastUsedAtUseCase.js';
import { RenewSessionUseCase } from '@/useCases/sessions/_internal/RenewSessionUseCase.js';

export class AuthenticateMiddleware {
  constructor(
    private readonly validateSessionUsecase: ValidateSessionUsecase,
    private readonly cookieSerializerService: ICookieSerializerService,
    private readonly updateSessionLastUsedAtUseCase: UpdateSessionLastUsedAtUseCase,
    private readonly renewSessionUseCase: RenewSessionUseCase
  ) {}

  handle(): RequestHandler {
    return async (req, res, next) => {
      const cookies = this.cookieSerializerService.parse(req.headers?.cookie ?? '');
      const rawToken = cookies[sessionCookieConfig.name] ?? null;
      if (!rawToken) {
        throw new UnauthorizedError();
      }

      const session = await this.validateSessionUsecase.execute({ rawToken });
      await this.updateSessionLastUsedAtUseCase.execute(session);

      const renewal = await this.renewSessionUseCase.execute(session);

      if (renewal.renewed) {
        const expiresAtInSeconds = Math.max(
          0,
          Math.floor((renewal.expiresAt.getTime() - Date.now()) / 1000)
        );
        const sessionCookie = this.cookieSerializerService.serialize(
          sessionCookieConfig.name,
          rawToken,
          {
            httpOnly: sessionCookieConfig.httpOnly,
            path: sessionCookieConfig.path,
            sameSite: sessionCookieConfig.sameSite,
            secure: sessionCookieConfig.secure,
            maxAge: expiresAtInSeconds,
          }
        );
        res.setHeader('Set-Cookie', sessionCookie);
      }

      req.auth = {
        sessionId: session.id,
        userId: session.userId,
        identityId: session.identityId,
      };

      next();
    };
  }
}
