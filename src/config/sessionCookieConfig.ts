export const sessionCookieConfig = {
  name: 'session_token',
  path: '/',
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
};
