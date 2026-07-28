import request from 'supertest';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';

import { db } from '@/adapters/database/knex/connection.js';
import app from '@/app.js';
import { CreateUserInput } from '@/useCases/CreateUser.js';

function makeCreateUserInput(overrides: Partial<CreateUserInput> = {}): CreateUserInput {
  return {
    name: 'John Doe',
    email: 'john@example.com',
    login: 'john',
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
      login: 'john',
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
        login: 'john',
      })
    );
  });

  it('should persist the password as a hash', async () => {
    const password = 'supersecret123';

    const response = await request(app).post('/users').send(makeCreateUserInput({ password }));
    const persistedUser = await db('users')
      .where({
        id: response.body.id,
      })
      .first();

    expect(persistedUser.password_hash).toEqual(expect.any(String));

    expect(persistedUser.password_hash).not.toBe(password);
  });

  it('should not create a user with duplicated email', async () => {
    await request(app).post('/users').send(makeCreateUserInput()).expect(201);

    const response = await request(app)
      .post('/users')
      .send(makeCreateUserInput({ login: 'john2' }));

    expect(response.status).toBe(400);

    const users = await db('users');

    expect(users).toHaveLength(1);
  });

  it('should not create a user with duplicated login', async () => {
    await request(app).post('/users').send(makeCreateUserInput()).expect(201);

    const response = await request(app)
      .post('/users')
      .send(makeCreateUserInput({ email: 'another@example.com' }));

    expect(response.status).toBe(400);

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
          login: 'john2',
        })
      );

    expect(response.status).toBe(400);

    const users = await db('users');
    expect(users).toHaveLength(1);
  });
});
