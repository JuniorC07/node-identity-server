import { CreateOAuthClientUseCase } from '@/useCases/oauth/CreateOAuthClientUseCase.js';
import { CreateOAuthClientValidator } from '@/validators/oauth/CreateOAuthClientValidator.js';
import { type Request, type Response } from 'express';

export class CreateOAuthClientController {
  constructor(
    private readonly createOAuthClient: CreateOAuthClientUseCase,
    private readonly validator: CreateOAuthClientValidator
  ) {}
  handle = async (req: Request, res: Response): Promise<void> => {
    const input = this.validator.validate(req.body);

    const { client, clientSecret } = await this.createOAuthClient.execute(input);
    res.status(201).json({
      id: client.id,
      name: client.name,
      clientId: client.clientId,
      redirectUris: client.redirectUris,
      allowedScopes: client.allowedScopes,
      secret: clientSecret,
      type: client.type,
      createdAt: client.createdAt,
      updatedAt: client.updatedAt,
    });
  };
}
