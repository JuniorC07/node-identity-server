export interface IOAuthClientCredentialsService {
  generateClientId(): string;
  generateClientSecret(): string;
}
