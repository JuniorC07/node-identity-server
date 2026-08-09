export interface IPkceService {
  isValidChallenge(codeChallenge: string): boolean;
  createChallenge(codeVerifier: string): string;
  isValidVerifier(codeVerifier: string): boolean;
}
