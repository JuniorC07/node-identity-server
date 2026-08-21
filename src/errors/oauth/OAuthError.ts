import { AppError, type AppErrorParams } from '@/errors/AppError.js';

export type OAuthErrorCode =
  | 'access_denied'
  | 'invalid_client'
  | 'invalid_grant'
  | 'invalid_request'
  | 'invalid_scope'
  | 'unsupported_grant_type'
  | 'unsupported_response_type';

export interface OAuthErrorParams extends Omit<AppErrorParams, 'code'> {
  code: OAuthErrorCode;
  wwwAuthenticate?: string;
}

export class OAuthError extends AppError {
  public readonly wwwAuthenticate: string | null;

  constructor({ wwwAuthenticate, ...params }: OAuthErrorParams) {
    super(params);
    this.wwwAuthenticate = wwwAuthenticate ?? null;
  }
}

