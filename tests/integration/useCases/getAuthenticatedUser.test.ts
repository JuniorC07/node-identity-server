import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { faker } from '@faker-js/faker';

import { db } from '@/adapters/database/knex/connection.js';
import app from '@/app.js';
import { makeCreateUser } from '@/main/factories/useCases/users/makeCreateUserUseCase.js';
import { makeSHA256SessionTokenService } from '@/main/factories/services/makeSessionTokenService.js';
import { makeCreateLocalSessionUseCase } from '@/main/factories/useCases/sessions/makeCreateSessionUseCase.js';
import { CreateUserInput } from '@/useCases/users/CreateUserUseCase.js';
import { CreateLocalSessionOutput } from '@/useCases/sessions/CreateLocalSessionUseCase.js';
import { sessionCookieConfig } from '@/config/sessionCookieConfig.js';
import { User } from '@/entities/User.js';
import { sessionExpirationInMilliSeconds } from '@/config/sessionExpirationInMilliSeconds.js';

const SESSION_LIFETIME = sessionExpirationInMilliSeconds;
const RENEWAL_THRESHOLD = SESSION_LIFETIME / 3;
let createdSession: null | CreateLocalSessionOutput = null;
let createdUser: null | User = null;

interface createUserAndSessionOutput {
  user: User;
  sessionOutput: CreateLocalSessionOutput;
}

async function createUserAndSession(
  overrides: Partial<CreateUserInput> = {}
): Promise<createUserAndSessionOutput> {
  const createUser = makeCreateUser();
  const createSession = makeCreateLocalSessionUseCase();
  const email = faker.internet.email();
  const password = faker.internet.password();
  const { user } = await createUser.execute({
    name: faker.person.fullName(),
    username: faker.internet.username(),
    password,
    email,
    ...overrides,
  });

  createdUser = user;

  createdSession = await createSession.execute({
    identifier: email,
    password,
    ipAddress: null,
    userAgent: null,
  });

  return { sessionOutput: createdSession, user };
}

describe('GET /users/me', () => {
  beforeAll(async () => {
    await createUserAndSession();
  });

  afterAll(async () => {
    await db('users').delete();
    await db.destroy();
  });

  it('should return 200 with correct user data', async () => {
    const beforeUpdate = new Date();

    const response = await request(app)
      .get('/users/me')
      .set('Cookie', [
        `${sessionCookieConfig.name}=${createdSession?.rawToken}; Max-Age=1295999; Path=/; HttpOnly; SameSite=Lax`,
      ]);
    const afterUpdate = new Date();

    const sessionTokenService = makeSHA256SessionTokenService();
    const hashedToken = sessionTokenService.hash(createdSession?.rawToken ?? '');

    const persistedSession = await db('sessions').where({ token_hash: hashedToken }).first();
    expect(persistedSession?.last_used_at).toBeDefined();

    const persistedLastUsedAt = new Date(persistedSession!.last_used_at);

    expect(persistedLastUsedAt.getTime()).toBeGreaterThan(beforeUpdate.getTime());
    expect(persistedLastUsedAt.getTime()).toBeLessThan(afterUpdate.getTime());
    expect(response.headers['set-cookie']).not.toBeDefined();

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      ...createdUser,
      createdAt: createdUser?.createdAt.toISOString(),
      updatedAt: createdUser?.updatedAt.toISOString(),
    });
  });

  it('should return 200 with correct data/cookie and renew session when one third of its lifetime remains', async () => {
    const sessionTokenService = makeSHA256SessionTokenService();
    const hashedToken = sessionTokenService.hash(createdSession?.rawToken ?? '');
    const expiresAtRenewalThreshold = new Date(Date.now() + RENEWAL_THRESHOLD);

    await db('sessions')
      .update({ expires_at: expiresAtRenewalThreshold })
      .where({ token_hash: hashedToken });

    const response = await request(app)
      .get('/users/me')
      .set('Cookie', [
        `${sessionCookieConfig.name}=${createdSession?.rawToken}; Max-Age=1295999; Path=/; HttpOnly; SameSite=Lax`,
      ]);

    const persistedSession = await db('sessions').where({ token_hash: hashedToken }).first();

    expect(persistedSession.expires_at.getTime()).toBeGreaterThan(
      expiresAtRenewalThreshold.getTime()
    );
    expect(response.headers['set-cookie']).toBeDefined();

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      ...createdUser,
      createdAt: createdUser?.createdAt.toISOString(),
      updatedAt: createdUser?.updatedAt.toISOString(),
    });
  });

  it('should not renew session when more than one third of its lifetime remains', async () => {
    const { sessionOutput } = await createUserAndSession();
    const sessionTokenService = makeSHA256SessionTokenService();
    const hashedToken = sessionTokenService.hash(sessionOutput.rawToken);
    const expiresAfterRenewalThreshold = new Date(Date.now() + RENEWAL_THRESHOLD + 60_000);

    await db('sessions')
      .update({ expires_at: expiresAfterRenewalThreshold })
      .where({ token_hash: hashedToken });

    const response = await request(app)
      .get('/users/me')
      .set('Cookie', [
        `${sessionCookieConfig.name}=${sessionOutput.rawToken}; Max-Age=1295999; Path=/; HttpOnly; SameSite=Lax`,
      ]);

    const persistedSession = await db('sessions').where({ token_hash: hashedToken }).first();

    expect(persistedSession.expires_at.getTime()).toBe(expiresAfterRenewalThreshold.getTime());
    expect(response.headers['set-cookie']).toBeUndefined();
    expect(response.status).toBe(200);
  });

  it('should return 401 with invalid cookie name but valid value', async () => {
    const response = await request(app)
      .get('/users/me')
      .set('Cookie', [
        `invalid=${createdSession?.rawToken}; Max-Age=1295999; Path=/; HttpOnly; SameSite=Lax`,
      ]);
    expect(response.status).toBe(401);
    expect(response.body?.name).toBe('unauthorized');
    expect(response.body?.message).toBe(
      'Valid authentication are required to access this resource.'
    );
  });

  it('should return 401 with valid cookie name but invalid value', async () => {
    const response = await request(app)
      .get('/users/me')
      .set('Cookie', [
        `${sessionCookieConfig.name}=invalid-token; Max-Age=1295999; Path=/; HttpOnly; SameSite=Lax`,
      ]);

    expect(response.status).toBe(401);
    expect(response.body?.name).toBe('unauthorized');
    expect(response.body?.message).toBe(
      'Valid authentication are required to access this resource.'
    );
  });

  it('should return 401 with invalid cookie name and invalid value', async () => {
    const response = await request(app)
      .get('/users/me')
      .set('Cookie', [
        `invalid-name=invalid-token; Max-Age=1295999; Path=/; HttpOnly; SameSite=Lax`,
      ]);

    expect(response.status).toBe(401);
    expect(response.body?.name).toBe('unauthorized');
    expect(response.body?.message).toBe(
      'Valid authentication are required to access this resource.'
    );
  });

  it('should return 401 with valid cookie name and valid value, but expired', async () => {
    const { sessionOutput } = await createUserAndSession();
    const sessionTokenService = makeSHA256SessionTokenService();
    const hashedToken = sessionTokenService.hash(sessionOutput.rawToken);

    await db('sessions').update({ expires_at: new Date() }).where({ token_hash: hashedToken });

    const response = await request(app)
      .get('/users/me')
      .set('Cookie', [
        `${sessionCookieConfig.name}=${sessionOutput?.rawToken}; Max-Age=1295999; Path=/; HttpOnly; SameSite=Lax`,
      ]);
    expect(response.status).toBe(401);
    expect(response.body?.name).toBe('unauthorized');
    expect(response.body?.message).toBe(
      'Valid authentication are required to access this resource.'
    );
  });

  it('should return 401 with valid cookie name and valid value, but revoked', async () => {
    const { sessionOutput } = await createUserAndSession();
    const sessionTokenService = makeSHA256SessionTokenService();
    const hashedToken = sessionTokenService.hash(sessionOutput.rawToken);

    await db('sessions').update({ revoked_at: new Date() }).where({ token_hash: hashedToken });

    const response = await request(app)
      .get('/users/me')
      .set('Cookie', [
        `${sessionCookieConfig.name}=${sessionOutput?.rawToken}; Max-Age=1295999; Path=/; HttpOnly; SameSite=Lax`,
      ]);
    expect(response.status).toBe(401);
    expect(response.body?.name).toBe('unauthorized');
    expect(response.body?.message).toBe(
      'Valid authentication are required to access this resource.'
    );
  });
});
