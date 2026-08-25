import type { Request, Response } from 'express';

import type { OpenIdProviderConfiguration } from '@/config/oidcConfig.js';

export class GetOpenIdConfigurationController {
  constructor(private readonly configuration: OpenIdProviderConfiguration) {}

  handle = (_req: Request, res: Response): void => {
    res.setHeader('Cache-Control', 'public, max-age=300');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).json(this.configuration);
  };
}
