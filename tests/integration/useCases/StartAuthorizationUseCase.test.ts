import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { faker } from '@faker-js/faker';

import { db } from '@/adapters/database/knex/connection.js';
import app from '@/app.js';
import { makeCreateUser } from '@/main/factories/useCases/users/makeCreateUserUseCase.js';
import { makeCreateOAuthClientUseCase } from '@/main/factories/useCases/oauth/makeCreateOAuthClientUseCase.js';
import { makeCreateLocalSessionUseCase } from '@/main/factories/useCases/sessions/makeCreateSessionUseCase.js';
import { CreateUserInput } from '@/useCases/users/CreateUserUseCase.js';
import { CreateLocalSessionOutput } from '@/useCases/sessions/CreateLocalSessionUseCase.js';
import { sessionCookieConfig } from '@/config/sessionCookieConfig.js';
import { User } from '@/entities/User.js';
import { CreateOAuthClientOutput } from '@/useCases/oauth/CreateOAuthClientUseCase.js';
import { randomUUID } from 'node:crypto';
import { makeGrantOAuthConsentUseCase } from '@/main/factories/useCases/oauth/makeGrantOAuthConsentUseCase.js';
import { SHA256SessionTokenService } from '@/adapters/crypto/sha256/SHA256SessionTokenService.js';

let createdSession: null | CreateLocalSessionOutput = null;
let createdClient: null | CreateOAuthClientOutput = null;
let createdUser: User;

const resourceId = randomUUID();
const profileId = randomUUID();
const moduleId = randomUUID();
const readActionId = randomUUID();
const writeActionId = randomUUID();
const deleteActionId = randomUUID();
const readScopeId = randomUUID();
const writeScopeId = randomUUID();
const deleteScopeId = randomUUID();
const audience = 'https://api.example.com/orders';
const codeVerifier = 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk';
const callbackUri = 'http://localhost:3001/callback';

interface createUserAndSessionOutput {
  user: User;
  sessionOutput: CreateLocalSessionOutput;
  client: CreateOAuthClientOutput;
}

async function createUserAndSession(
  overrides: Partial<CreateUserInput> = {}
): Promise<createUserAndSessionOutput> {
  const createUser = makeCreateUser();
  const createSession = makeCreateLocalSessionUseCase();
  const createClient = makeCreateOAuthClientUseCase();
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

  const now = new Date();
  await db('oauth_resources').insert({
    id: resourceId,
    key: 'orders-api',
    audience,
    name: 'Orders API',
    created_at: now,
    updated_at: now,
  });
  await db('authorization_profiles').insert({
    id: profileId,
    resource_id: resourceId,
    key: 'orders-manager',
    name: 'Orders manager',
    created_at: now,
    updated_at: now,
  });
  await db('authorization_modules').insert({
    id: moduleId,
    resource_id: resourceId,
    key: 'orders',
    name: 'Orders',
    created_at: now,
    updated_at: now,
  });
  await db('authorization_actions').insert([
    {
      id: readActionId,
      key: 'read',
      name: 'Read',
      created_at: now,
      updated_at: now,
    },
    {
      id: writeActionId,
      key: 'write',
      name: 'Write',
      created_at: now,
      updated_at: now,
    },
    {
      id: deleteActionId,
      key: 'delete',
      name: 'Delete',
      created_at: now,
      updated_at: now,
    },
  ]);
  await db('oauth_scopes').insert([
    {
      id: readScopeId,
      key: 'orders:read',
      type: 'resource',
      resource_id: resourceId,
      module_id: moduleId,
      action_id: readActionId,
      description: 'Read orders',
      consent_required: false,
      enabled: true,
      created_at: now,
      updated_at: now,
    },
    {
      id: writeScopeId,
      key: 'orders:write',
      type: 'resource',
      resource_id: resourceId,
      module_id: moduleId,
      action_id: writeActionId,
      description: 'Modify orders',
      consent_required: true,
      enabled: true,
      created_at: now,
      updated_at: now,
    },
    {
      id: deleteScopeId,
      key: 'orders:delete',
      type: 'resource',
      resource_id: resourceId,
      module_id: moduleId,
      action_id: deleteActionId,
      description: 'Delete orders',
      consent_required: false,
      enabled: true,
      created_at: now,
      updated_at: now,
    },
  ]);
  await db('user_resource_profiles').insert({
    user_id: user.id,
    resource_id: resourceId,
    profile_id: profileId,
    assigned_at: now,
  });
  await db('profile_scopes').insert([
    { profile_id: profileId, resource_id: resourceId, scope_id: readScopeId },
    { profile_id: profileId, resource_id: resourceId, scope_id: writeScopeId },
  ]);

  createdClient = await createClient.execute({
    allowedScopes: ['openid', 'profile', 'orders:read', 'orders:write', 'orders:delete'],
    name: 'client',
    type: 'public',
    redirectUris: [callbackUri],
  });
  return { sessionOutput: createdSession, user, client: createdClient };
}

describe('GET /oauth/authorize', () => {
  beforeAll(async () => {
    await createUserAndSession();
  });

  afterAll(async () => {
    await db('users').delete();
    await db('oauth_clients').delete();
    await db('oauth_resources').delete();
    await db.destroy();
  });

  function authorizationRequest(
    scope: string,
    client: CreateOAuthClientOutput | null = createdClient
  ) {
    return request(app)
      .get('/oauth/authorize')
      .query({
        response_type: 'code',
        client_id: client?.client.clientId,
        redirect_uri: callbackUri,
        scope,
        state: 'E9Melhoa2OwvFrEMTJgu',
        nonce: 'EMTJguCHaoeK1t8URWbuGJ',
        code_challenge: 'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM',
        code_challenge_method: 'S256',
      })
      .set('Cookie', [
        `${sessionCookieConfig.name}=${createdSession?.rawToken}; Max-Age=1295999; Path=/; HttpOnly; SameSite=Lax`,
      ]);
  }

  function authenticatedPost(path: string) {
    return request(app)
      .post(path)
      .set('Cookie', [
        `${sessionCookieConfig.name}=${createdSession?.rawToken}; Max-Age=1295999; Path=/; HttpOnly; SameSite=Lax`,
      ]);
  }

  function getAuthorizationCode(location: string): string {
    const code = new URL(location).searchParams.get('code');

    expect(code).toBeTruthy();
    return code!;
  }

  function exchangeAuthorizationCode(code: string, verifier = codeVerifier) {
    return request(app).post('/oauth/token').type('form').send({
      grant_type: 'authorization_code',
      code,
      redirect_uri: callbackUri,
      client_id: createdClient?.client.clientId,
      code_verifier: verifier,
    });
  }

  it('should issue and exchange a one-time authorization code', async () => {
    const response = await authorizationRequest('orders:read');

    expect(response.status).toBe(302);
    expect(response.headers.location).toContain(`${callbackUri}?code=`);
    expect(response.headers.location).toContain('state=E9Melhoa2OwvFrEMTJgu');

    const code = getAuthorizationCode(response.headers.location);
    const tokenResponse = await exchangeAuthorizationCode(code);

    expect(tokenResponse.status).toBe(200);
    expect(tokenResponse.headers['cache-control']).toBe('no-store');
    expect(tokenResponse.body.access_token).toBeDefined();
    expect(tokenResponse.body.token_type).toBe('Bearer');
    expect(tokenResponse.body.scope).toBe('orders:read');
    expect(tokenResponse.body.id_token).toBeUndefined();

    const replayResponse = await exchangeAuthorizationCode(code);

    expect(replayResponse.status).toBe(400);
    expect(replayResponse.body.error).toBe('invalid_grant');
  });

  it('should redirect to consent when an active consent grant is missing', async () => {
    const response = await authorizationRequest('orders:write');

    expect(response.status).toBe(302);
    expect(response.headers.location).toMatch(/^\/consent\?authorization_request=[A-Za-z0-9_-]+$/);
  });

  it('should expose consent context only to the bound session', async () => {
    const authorizationResponse = await authorizationRequest('orders:write');
    const location = new URL(authorizationResponse.headers.location, 'http://identity.local');
    const authorizationRequestToken = location.searchParams.get('authorization_request');

    const response = await request(app)
      .get(`/oauth/authorization-requests/${authorizationRequestToken}`)
      .set('Cookie', [
        `${sessionCookieConfig.name}=${createdSession?.rawToken}; Max-Age=1295999; Path=/; HttpOnly; SameSite=Lax`,
      ]);

    expect(response.status).toBe(200);
    expect(response.body.client.clientId).toBe(createdClient?.client.clientId);
    expect(response.body.requestedScopes).toEqual([
      {
        key: 'orders:write',
        type: 'resource',
        description: 'Modify orders',
        consentRequired: true,
        consentGranted: false,
      },
    ]);
    expect(response.body.audiences).toEqual([audience]);
    expect(response.body.modules).toEqual(['orders']);
  });

  it('should deny consent and preserve state without issuing a code', async () => {
    const authorizationResponse = await authorizationRequest('orders:write');
    const location = new URL(authorizationResponse.headers.location, 'http://identity.local');
    const authorizationRequestToken = location.searchParams.get('authorization_request');
    const response = await authenticatedPost('/oauth/authorize/decision').send({
      authorization_request_token: authorizationRequestToken,
      decision: 'deny',
    });

    expect(response.status).toBe(303);
    const callback = new URL(response.headers.location);
    expect(callback.origin + callback.pathname).toBe(callbackUri);
    expect(callback.searchParams.get('error')).toBe('access_denied');
    expect(callback.searchParams.get('state')).toBe('E9Melhoa2OwvFrEMTJgu');
    expect(callback.searchParams.get('code')).toBeNull();
  });

  it('should grant consent and exchange the resulting code', async () => {
    const authorizationResponse = await authorizationRequest('orders:write');
    const location = new URL(authorizationResponse.headers.location, 'http://identity.local');
    const authorizationRequestToken = location.searchParams.get('authorization_request');
    const decisionResponse = await authenticatedPost('/oauth/authorize/decision').send({
      authorization_request_token: authorizationRequestToken,
      decision: 'approve',
    });

    expect(decisionResponse.status).toBe(303);
    const code = getAuthorizationCode(decisionResponse.headers.location);
    const wrongVerifierResponse = await exchangeAuthorizationCode(code, 'A'.repeat(43));

    expect(wrongVerifierResponse.status).toBe(400);
    expect(wrongVerifierResponse.body.error).toBe('invalid_grant');

    const tokenResponse = await exchangeAuthorizationCode(code);

    expect(tokenResponse.status).toBe(200);
    expect(tokenResponse.body.scope).toBe('orders:write');
  });

  it('should reuse an active consent grant', async () => {
    const grantOAuthConsentUseCase = makeGrantOAuthConsentUseCase();
    await grantOAuthConsentUseCase.execute({
      userId: createdUser.id,
      oauthClientId: createdClient!.client.id,
      scopeIds: [writeScopeId],
      expiresAt: null,
    });

    const response = await authorizationRequest('orders:write');

    expect(response.status).toBe(302);
    expect(response.headers.location).toContain(`${callbackUri}?code=`);
  });

  it('should return an ID token only when openid is requested', async () => {
    const response = await authorizationRequest('openid');
    const code = getAuthorizationCode(response.headers.location);
    const tokenResponse = await exchangeAuthorizationCode(code);

    expect(tokenResponse.status).toBe(200);
    expect(tokenResponse.body.access_token).toBeDefined();
    expect(tokenResponse.body.id_token).toBeDefined();
    expect(tokenResponse.body.id_token.split('.')).toHaveLength(3);
  });

  it('should reject an expired authorization code', async () => {
    const response = await authorizationRequest('orders:read');
    const code = getAuthorizationCode(response.headers.location);
    const codeHash = new SHA256SessionTokenService().hash(code);
    const now = Date.now();

    await db('oauth_authorization_codes')
      .where({ code_hash: codeHash })
      .update({
        created_at: new Date(now - 120_000),
        expires_at: new Date(now - 60_000),
      });

    const tokenResponse = await exchangeAuthorizationCode(code);

    expect(tokenResponse.status).toBe(400);
    expect(tokenResponse.body.error).toBe('invalid_grant');
  });

  it('should require the exact redirect URI again at the token endpoint', async () => {
    const response = await authorizationRequest('orders:read');
    const code = getAuthorizationCode(response.headers.location);
    const wrongRedirectResponse = await request(app)
      .post('/oauth/token')
      .type('form')
      .send({
        grant_type: 'authorization_code',
        code,
        redirect_uri: `${callbackUri}/other`,
        client_id: createdClient?.client.clientId,
        code_verifier: codeVerifier,
      });

    expect(wrongRedirectResponse.status).toBe(400);
    expect(wrongRedirectResponse.body.error).toBe('invalid_grant');

    const tokenResponse = await exchangeAuthorizationCode(code);
    expect(tokenResponse.status).toBe(200);
  });

  it('should authenticate a confidential client with HTTP Basic', async () => {
    const confidentialClient = await makeCreateOAuthClientUseCase().execute({
      allowedScopes: ['openid'],
      name: 'Confidential client',
      type: 'confidential',
      redirectUris: [callbackUri],
    });
    const authorizationResponse = await authorizationRequest('openid', confidentialClient);
    const code = getAuthorizationCode(authorizationResponse.headers.location);
    const credentials = Buffer.from(
      `${confidentialClient.client.clientId}:${confidentialClient.clientSecret}`
    ).toString('base64');
    const tokenResponse = await request(app)
      .post('/oauth/token')
      .set('Authorization', `Basic ${credentials}`)
      .type('form')
      .send({
        grant_type: 'authorization_code',
        code,
        redirect_uri: callbackUri,
        code_verifier: codeVerifier,
      });

    expect(tokenResponse.status).toBe(200);
    expect(tokenResponse.body.access_token).toBeDefined();
    expect(tokenResponse.body.id_token).toBeDefined();
  });

  it('should deny a scope not granted by the profile for the audience', async () => {
    const response = await authorizationRequest('orders:delete');

    expect(response.status).toBe(403);
    expect(response.body.name).toBe('oauth_access_denied');
  });

  it('should reject an unregistered scope', async () => {
    const response = await request(app)
      .get('/oauth/authorize')
      .query({
        response_type: 'code',
        client_id: createdClient?.client.clientId,
        redirect_uri: 'http://localhost:3001/callback',
        scope: 'unknown:scope',
        state: 'E9Melhoa2OwvFrEMTJgu',
        nonce: 'EMTJguCHaoeK1t8URWbuGJ',
        code_challenge: 'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM',
        code_challenge_method: 'S256',
      })
      .set('Cookie', [
        `${sessionCookieConfig.name}=${createdSession?.rawToken}; Max-Age=1295999; Path=/; HttpOnly; SameSite=Lax`,
      ]);
    expect(response.status).toBe(400);
    expect(response.body.name).toBe('invalid_oauth_scope');
  });
});
