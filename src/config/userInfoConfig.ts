import { oidcConfig } from '@/config/oidcConfig.js';

export const userInfoConfig = {
  audience: oidcConfig.endpoints.userInfo,
};
