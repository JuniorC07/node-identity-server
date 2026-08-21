export interface PublicJsonWebKey {
  kty: string;
  kid: string;
  use: 'sig';
  key_ops: ['verify'];
  alg: 'RS256';
  n?: string;
  e?: string;
}

export interface JsonWebKeySet {
  keys: PublicJsonWebKey[];
}

export interface IJsonWebKeySetService {
  getPublicKeySet(): Promise<JsonWebKeySet>;
}
