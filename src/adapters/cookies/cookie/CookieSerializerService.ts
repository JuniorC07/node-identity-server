import * as cookie from 'cookie';

import {
  ICookieSerializerService,
  CookieOptions,
  ParsedCookies,
} from '@/services/ICookieSerializerService.js';

export class CookieSerializerService implements ICookieSerializerService {
  serialize(name: string, value: string, options?: CookieOptions): string {
    return cookie.stringifySetCookie({ name, value, ...options });
  }
  parse(cookieUnparsed: string): ParsedCookies {
    return cookie.parseCookie(cookieUnparsed);
  }
}
