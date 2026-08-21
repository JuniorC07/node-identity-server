import { GetJsonWebKeySetController } from '@/controllers/well-known/GetJsonWebKeySetController.js';
import { makeJsonWebKeySetService } from '@/main/factories/services/makeJsonWebKeySetService.js';

export function makeGetJsonWebKeySetController(): GetJsonWebKeySetController {
  const jsonWebKeySetService = makeJsonWebKeySetService();

  return new GetJsonWebKeySetController(jsonWebKeySetService);
}
