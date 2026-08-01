export interface CookieOptions {
  path: string;
  httpOnly: boolean;
  sameSite: boolean | 'lax' | 'strict' | 'none';
  secure: boolean;
  maxAge: number;
}

export type ParsedCookies = {
  [x: string]: string | undefined;
};

export interface ICookieSerializerService {
  serialize(name: string, value: string, options: CookieOptions): string;
  parse(cookieUnparsed: string): ParsedCookies;
}
