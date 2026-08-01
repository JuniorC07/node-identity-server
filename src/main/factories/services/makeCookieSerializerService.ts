import { ICookieSerializerService } from '@/services/ICookieSerializerService.js';
import { CookieSerializerService } from '@/adapters/cookies/cookie/CookieSerializerService.js';

export function makeCookieSerializerService(): ICookieSerializerService {
  return new CookieSerializerService();
}
