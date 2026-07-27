import request from 'supertest';
import { describe, expect, it } from 'vitest';

import app from '@/app.js';

describe('GET /ping', () => {
  it('should return 200', async () => {
    const response = await request(app).get('/ping');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: 'pong',
    });
  });
});
