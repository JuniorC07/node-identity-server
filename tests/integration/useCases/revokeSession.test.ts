import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { faker } from '@faker-js/faker';
import * as cookie from 'cookie';
import { db } from '@/adapters/database/knex/connection.js';
import app from '@/app.js';
import { makeCreateUser } from '@/main/factories/useCases/users/makeCreateUserUseCase.js';
import { makeSHA256SessionTokenService } from '@/main/factories/services/makeSessionTokenService.js';
import { makeCreateLocalSessionUseCase } from '@/main/factories/useCases/sessions/makeCreateSessionUseCase.js';
import { CreateUserInput } from '@/useCases/users/CreateUserUseCase.js';
import { CreateLocalSessionOutput } from '@/useCases/sessions/CreateLocalSessionUseCase.js';
import { sessionCookieConfig } from '@/config/sessionCookieConfig.js';
import { User } from '@/entities/User.js';

let createdSession: null | CreateLocalSessionOutput = null;
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

  createdSession = await createSession.execute({
    identifier: email,
    password,
    ipAddress: null,
    userAgent: null,
  });

  return { sessionOutput: createdSession, user };
}

describe('DELETE /sessions/current', () => {
  beforeAll(async () => {
    await createUserAndSession();
  });

  afterAll(async () => {
    await db('users').delete();
    await db.destroy();
  });

  it('should return 204 revoking session correctly', async () => {
    const beforeUpdate = new Date();

    const response = await request(app)
      .delete('/sessions/current')
      .set('Cookie', [
        `${sessionCookieConfig.name}=${createdSession?.rawToken}; Max-Age=1295999; Path=/; HttpOnly; SameSite=Lax`,
      ]);

    const sessionTokenService = makeSHA256SessionTokenService();
    const hashedToken = sessionTokenService.hash(createdSession?.rawToken ?? '');
    const [rawCookie] = response.headers['set-cookie'] ?? [];

    const parsedCookie = cookie.parseCookie(rawCookie);
    const persistedSession = await db('sessions').where({ token_hash: hashedToken }).first();

    expect(rawCookie).toBeDefined();
    expect(Number(parsedCookie['Max-Age'])).toBe(0);

    expect(persistedSession?.revoked_at).toBeDefined();
    const persistedrevokedAt = new Date(persistedSession!.revoked_at);
    expect(persistedrevokedAt.getTime()).toBeGreaterThan(beforeUpdate.getTime());
    expect(response.status).toBe(204);
  });

  it('should return 401 with no session cookie', async () => {
    const response = await request(app).delete('/sessions/current');
    const [rawCookie] = response.headers['set-cookie'] ?? [];

    expect(rawCookie).toBeUndefined();
    expect(response.body.name).toBe('unauthorized');
    expect(response.status).toBe(401);
  });
});
