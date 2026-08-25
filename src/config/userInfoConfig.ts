import { accessTokenConfig } from '@/config/accessTokenConfig.js';

export const userInfoConfig = {
  audience: new URL('/oauth/userinfo', accessTokenConfig.issuer).toString(),
};
