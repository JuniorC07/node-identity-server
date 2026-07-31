import * as cookie from 'cookie';

import { ICookieSerializerService, CookieOptions } from '@/services/ICookieSerializerService.js';

export class CookieSerializerService implements ICookieSerializerService {
  serialize(name: string, value: string, options?: CookieOptions): string {
    return cookie.stringifySetCookie({ name, value, ...options });
  }
}
