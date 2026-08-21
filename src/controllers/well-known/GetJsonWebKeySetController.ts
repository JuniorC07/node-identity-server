import { IJsonWebKeySetService } from '@/services/jwks/IJsonWebKeySetService.js';
import { type Request, type Response } from 'express';

export class GetJsonWebKeySetController {
  constructor(private readonly jwksService: IJsonWebKeySetService) {}

  handle = async (_req: Request, res: Response): Promise<void> => {
    const keySet = await this.jwksService.getPublicKeySet();

    res.setHeader('Cache-Control', 'public, max-age=300');

    res.setHeader('Access-Control-Allow-Origin', '*');

    res.status(200).json(keySet);
  };
}
