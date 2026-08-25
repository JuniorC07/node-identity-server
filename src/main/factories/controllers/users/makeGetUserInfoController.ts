import { getUserInfoController } from '@/controllers/users/getUserInfoController.js';
import { makeGetUserInfoUseCase } from '@/main/factories/useCases/users/makeGetUserInfoUseCase.js';

export function makeGetUserInfoController(): getUserInfoController {
  const getUserInfoUseCase = makeGetUserInfoUseCase();

  return new getUserInfoController(getUserInfoUseCase);
}
