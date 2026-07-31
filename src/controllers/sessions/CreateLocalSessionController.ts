import { sessionCookieConfig } from '@/config/sessionCookieConfig.js';
import { ICookieSerializerService } from '@/services/ICookieSerializerService.js';
import { CreateLocalSessionUseCase } from '@/useCases/sessions/CreateLocalSessionUseCase.js';
import { CreateSessionValidator } from '@/validators/sessions/createSession/CreateSessionValidator.js';
import { type Request, type Response } from 'express';

export class CreateLocalSessionController {
  constructor(
    private readonly createSessionUseCase: CreateLocalSessionUseCase,
    private readonly validator: CreateSessionValidator,
    private readonly cookieSerializerService: ICookieSerializerService
  ) {}
  handle = async (req: Request, res: Response): Promise<void> => {
    const body = req.body ?? {};
    const ipAddress = req.ip ?? null;
    const userAgent = req.get('user-agent') ?? null;
    const input = this.validator.validate({ ...body, ipAddress, userAgent });

    const { rawToken, expiresAt } = await this.createSessionUseCase.execute(input);
    const expiresAtInSeconds = Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / 1000));
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
    res.status(201).end();
  };
}
