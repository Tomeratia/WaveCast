import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../../app.js';
import { createTestUser, authHeader } from '../helpers.js';

describe('GET /api/favorites', () => {
  it('returns empty array for a new user', async () => {
    const { accessToken } = await createTestUser();

    const res = await request(app)
      .get('/api/favorites')
      .set(authHeader(accessToken));

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
  });

  it('returns 401 when unauthenticated', async () => {
    const res = await request(app).get('/api/favorites');
    expect(res.status).toBe(401);
  });
});

describe('POST /api/favorites/:spotId', () => {
  it('adds a favorite and returns 201', async () => {
    const { accessToken } = await createTestUser();

    const res = await request(app)
      .post('/api/favorites/spot-abc')
      .set(authHeader(accessToken));

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('favorite appears in GET after adding', async () => {
    const { accessToken } = await createTestUser({ email: 'fav2@example.com' });

    await request(app)
      .post('/api/favorites/spot-xyz')
      .set(authHeader(accessToken));

    const res = await request(app)
      .get('/api/favorites')
      .set(authHeader(accessToken));

    expect(res.body.data).toContain('spot-xyz');
  });
});

describe('DELETE /api/favorites/:spotId', () => {
  it('removes a favorite', async () => {
    const { accessToken } = await createTestUser({ email: 'del@example.com' });

    await request(app)
      .post('/api/favorites/spot-del')
      .set(authHeader(accessToken));

    await request(app)
      .delete('/api/favorites/spot-del')
      .set(authHeader(accessToken));

    const res = await request(app)
      .get('/api/favorites')
      .set(authHeader(accessToken));

    expect(res.body.data).not.toContain('spot-del');
  });
});
