import { IAuthorizationRequestsRepository } from '@/repositories/IAuthorizationRequestsRepository.js';
import { IOAuthConsentGrantsRepository } from '@/repositories/oauth/IOAuthConsentGrantsRepository.js';
import { IAuthorizationCodesRepository } from '@/repositories/oauth/IOAuthAuthorizationCodesRepository.js';
import { IUnitOfWork } from '@/services/database/IUnitOfWork.js';

export interface IAuthorizationApprovalRepositories {
  authorizationRequests: IAuthorizationRequestsRepository;
  authorizationCodes: IAuthorizationCodesRepository;
  consentGrants: IOAuthConsentGrantsRepository;
}

export type IAuthorizationApprovalUnitOfWork = IUnitOfWork<IAuthorizationApprovalRepositories>;
