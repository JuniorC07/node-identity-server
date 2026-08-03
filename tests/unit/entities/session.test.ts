import { describe, expect, it } from 'vitest';

import { Session } from '@/entities/Session.js';
import { sessionExpirationInMilliSeconds } from '@/config/sessionExpirationInMilliSeconds.js';

const SESSION_LIFETIME = sessionExpirationInMilliSeconds;
const RENEWAL_THRESHOLD = SESSION_LIFETIME / 3;
const NOW = new Date('2026-08-02T12:00:00.000Z');

function makeSession(expiresAt: Date): Session {
  return new Session({
    id: 'session-id',
    userId: 'user-id',
    identityId: 'identity-id',
    tokenHash: 'token-hash',
    ipAddress: null,
    userAgent: null,
    createdAt: new Date('2026-07-18T12:00:00.000Z'),
    lastUsedAt: NOW,
    expiresAt,
    revokedAt: null,
  });
}

describe('Session.shouldRenew', () => {
  it('should not renew when the remaining time is greater than one third of the session lifetime', () => {
    const session = makeSession(new Date(NOW.getTime() + RENEWAL_THRESHOLD + 1));

    expect(session.shouldRenew(NOW, SESSION_LIFETIME)).toBe(false);
  });

  it('should renew when the remaining time is exactly one third of the session lifetime', () => {
    const session = makeSession(new Date(NOW.getTime() + RENEWAL_THRESHOLD));

    expect(session.shouldRenew(NOW, SESSION_LIFETIME)).toBe(true);
  });

  it('should renew when the remaining time is less than one third of the session lifetime', () => {
    const session = makeSession(new Date(NOW.getTime() + RENEWAL_THRESHOLD - 1));

    expect(session.shouldRenew(NOW, SESSION_LIFETIME)).toBe(true);
  });

  it('should not renew when the session expires exactly now', () => {
    const session = makeSession(NOW);

    expect(session.shouldRenew(NOW, SESSION_LIFETIME)).toBe(false);
  });

  it('should not renew when the session is already expired', () => {
    const session = makeSession(new Date(NOW.getTime() - 1));

    expect(session.shouldRenew(NOW, SESSION_LIFETIME)).toBe(false);
  });
});
