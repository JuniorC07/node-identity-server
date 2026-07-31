import request from 'supertest';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';

import { db } from '@/adapters/database/knex/connection.js';
import app from '@/app.js';
import { CreateUserInput } from '@/useCases/users/CreateUserUseCase.js';

function makeCreateUserInput(overrides: Partial<CreateUserInput> = {}): CreateUserInput {
  return {
    name: 'John Doe',
    email: 'john@example.com',
    username: 'john',
    password: 'secret12345@',
    ...overrides,
  };
}

describe('POST /users', () => {
  beforeEach(async () => {
    await db('users').delete();
  });

  afterAll(async () => {
    await db.destroy();
  });

  it('should create a user', async () => {
    const response = await request(app).post('/users').send(makeCreateUserInput());
    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      id: expect.any(String),
      name: 'John Doe',
      email: 'john@example.com',
      username: 'john',
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    });
    expect(response.body).not.toHaveProperty('passwordHash');
  });

  it('should persist the user in the database', async () => {
    const response = await request(app).post('/users').send(makeCreateUserInput());

    const persistedUser = await db('users')
      .where({
        id: response.body.id,
      })
      .first();

    expect(persistedUser).toBeDefined();

    expect(persistedUser).toEqual(
      expect.objectContaining({
        id: response.body.id,
        name: 'John Doe',
        email: 'john@example.com',
        username: 'john',
      })
    );
    expect(persistedUser).not.toHaveProperty('login');
    expect(persistedUser).not.toHaveProperty('password_hash');
  });

  it('should persist a local identity for the user', async () => {
    const response = await request(app).post('/users').send(makeCreateUserInput());

    const persistedIdentity = await db('identities').where({ user_id: response.body.id }).first();

    expect(persistedIdentity).toEqual(
      expect.objectContaining({
        user_id: response.body.id,
        provider: 'local',
        provider_subject: 'john@example.com',
        provider_email: 'john@example.com',
      })
    );
  });

  it('should persist the password as a hash', async () => {
    const password = 'supersecret123';

    const response = await request(app).post('/users').send(makeCreateUserInput({ password }));
    const persistedIdentity = await db('identities')
      .where({
        user_id: response.body.id,
      })
      .first();

    expect(persistedIdentity.password_hash).toEqual(expect.any(String));

    expect(persistedIdentity.password_hash).not.toBe(password);
  });

  it('should not create a user with duplicated email', async () => {
    await request(app).post('/users').send(makeCreateUserInput()).expect(201);

    const response = await request(app)
      .post('/users')
      .send(makeCreateUserInput({ username: 'john2' }));

    expect(response.status).toBe(409);
    expect(response.body.name).toBe('user_already_exists');

    const users = await db('users');

    expect(users).toHaveLength(1);
  });

  it('should not create a user with duplicated username', async () => {
    await request(app).post('/users').send(makeCreateUserInput()).expect(201);

    const response = await request(app)
      .post('/users')
      .send(makeCreateUserInput({ email: 'another@example.com' }));

    expect(response.status).toBe(409);
    expect(response.body.name).toBe('user_already_exists');

    const users = await db('users');

    expect(users).toHaveLength(1);
  });

  it('should allow creating a user without a name', async () => {
    const response = await request(app)
      .post('/users')
      .send(makeCreateUserInput({ name: null }));

    expect(response.status).toBe(201);
    expect(response.body.name).toBeNull();

    const persistedUser = await db('users')
      .where({
        id: response.body.id,
      })
      .first();

    expect(persistedUser.name).toBeNull();
  });

  it('should transform user email to lowercase', async () => {
    const response = await request(app)
      .post('/users')
      .send(makeCreateUserInput({ email: 'ANOTHER@EXAMPLE.COM' }));

    expect(response.status).toBe(201);
    expect(response.body.email).toBe('another@example.com');

    const persistedUser = await db('users')
      .where({
        id: response.body.id,
      })
      .first();

    expect(persistedUser.email).toBe('another@example.com');
  });

  it('should not allow duplicated email with different casing', async () => {
    await request(app)
      .post('/users')
      .send(makeCreateUserInput({ email: 'john@example.com' }))
      .expect(201);

    const response = await request(app)
      .post('/users')
      .send(
        makeCreateUserInput({
          email: 'JOHN@EXAMPLE.COM',
          username: 'john2',
        })
      );

    expect(response.status).toBe(409);

    const users = await db('users');
    expect(users).toHaveLength(1);
  });

  it('should handle concurrent attempts with the same credentials', async () => {
    const [firstResponse, secondResponse] = await Promise.all([
      request(app).post('/users').send(makeCreateUserInput()),
      request(app).post('/users').send(makeCreateUserInput()),
    ]);

    expect([firstResponse.status, secondResponse.status].sort()).toEqual([201, 409]);

    const users = await db('users');
    const identities = await db('identities');

    expect(users).toHaveLength(1);
    expect(identities).toHaveLength(1);
  });

  it('should normalize username to lowercase', async () => {
    const response = await request(app)
      .post('/users')
      .send(makeCreateUserInput({ username: 'John.Doe' }));

    expect(response.status).toBe(201);
    expect(response.body.username).toBe('john.doe');

    const persistedUser = await db('users').where({ id: response.body.id }).first();
    expect(persistedUser.username).toBe('john.doe');
  });

  it('should not allow duplicated username with different casing', async () => {
    await request(app)
      .post('/users')
      .send(makeCreateUserInput({ username: 'john.doe' }))
      .expect(201);

    const response = await request(app)
      .post('/users')
      .send(makeCreateUserInput({ email: 'another@example.com', username: 'JOHN.DOE' }));

    expect(response.status).toBe(409);
  });

  it('should require username', async () => {
    const input = makeCreateUserInput() as Partial<CreateUserInput>;
    delete input.username;

    const response = await request(app).post('/users').send(input);

    expect(response.status).toBe(400);
    expect(response.body.name).toBe('bad_request');
  });

  it('should reject username longer than 50 characters', async () => {
    const response = await request(app)
      .post('/users')
      .send(makeCreateUserInput({ username: 'a'.repeat(51) }));

    expect(response.status).toBe(400);
    expect(response.body.name).toBe('bad_request');
  });

  it('should not allow create user with password length < 12', async () => {
    const password = '123456789';
    const response = await request(app).post('/users').send(makeCreateUserInput({ password }));

    expect(response.status).toBe(400);
    expect(response.body.name).toBe('bad_request');

    const users = await db('users');
    expect(users).toHaveLength(0);
    expect(users).toHaveLength(0);
  });

  it('should not allow create user with password as undefined', async () => {
    const password = undefined;
    const response = await request(app).post('/users').send(makeCreateUserInput({ password }));

    expect(response.status).toBe(400);
    expect(response.body.name).toBe('bad_request');

    const users = await db('users');
    expect(users).toHaveLength(0);
    expect(users).toHaveLength(0);
  });

  it('should not allow create user with password > 72 bytes', async () => {
    const password = '🔐'.repeat(19); // 76 bytes

    expect(Buffer.byteLength(password, 'utf8')).toBe(76);

    const response = await request(app).post('/users').send(makeCreateUserInput({ password }));

    expect(response.status).toBe(400);
    expect(response.body.name).toBe('bad_request');

    const users = await db('users');
    expect(users).toHaveLength(0);
  });

  it('should allow create user with password of exactly 72 bytes', async () => {
    const password = 'a'.repeat(72);

    const response = await request(app).post('/users').send(makeCreateUserInput({ password }));

    expect(response.status).toBe(201);

    const users = await db('users');
    expect(users).toHaveLength(1);
  });
});
