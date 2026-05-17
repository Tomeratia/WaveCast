import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../../app.js';
import { createTestUser, authHeader } from '../helpers.js';

const validAlert = { spotId: 'spot-abc', minScore: 70, timePref: 'morning' };

describe('GET /api/alerts', () => {
  it('returns empty array for new user', async () => {
    const { accessToken } = await createTestUser();

    const res = await request(app)
      .get('/api/alerts')
      .set(authHeader(accessToken));

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
  });

  it('returns 401 when unauthenticated', async () => {
    const res = await request(app).get('/api/alerts');
    expect(res.status).toBe(401);
  });
});

describe('POST /api/alerts', () => {
  it('creates an alert and returns 201', async () => {
    const { accessToken } = await createTestUser({ email: 'alert1@example.com' });

    const res = await request(app)
      .post('/api/alerts')
      .set(authHeader(accessToken))
      .send(validAlert);

    expect(res.status).toBe(201);
    expect(res.body.data.spotId).toBe('spot-abc');
    expect(res.body.data.minScore).toBe(70);
  });

  it('returns 400 for invalid payload', async () => {
    const { accessToken } = await createTestUser({ email: 'alert2@example.com' });

    const res = await request(app)
      .post('/api/alerts')
      .set(authHeader(accessToken))
      .send({ spotId: 'spot-abc', minScore: 200 }); // minScore out of range, missing timePref

    expect(res.status).toBe(400);
  });
});

describe('PUT /api/alerts/:alertId', () => {
  it('updates an alert', async () => {
    const { accessToken } = await createTestUser({ email: 'alert3@example.com' });

    const createRes = await request(app)
      .post('/api/alerts')
      .set(authHeader(accessToken))
      .send(validAlert);

    const alertId = createRes.body.data.id;

    const res = await request(app)
      .put(`/api/alerts/${alertId}`)
      .set(authHeader(accessToken))
      .send({ minScore: 50, active: false });

    expect(res.status).toBe(200);
  });
});

describe('DELETE /api/alerts/:alertId', () => {
  it('deletes an alert', async () => {
    const { accessToken } = await createTestUser({ email: 'alert4@example.com' });

    const createRes = await request(app)
      .post('/api/alerts')
      .set(authHeader(accessToken))
      .send(validAlert);

    const alertId = createRes.body.data.id;

    const deleteRes = await request(app)
      .delete(`/api/alerts/${alertId}`)
      .set(authHeader(accessToken));

    expect(deleteRes.status).toBe(200);

    const listRes = await request(app)
      .get('/api/alerts')
      .set(authHeader(accessToken));

    expect(listRes.body.data).toHaveLength(0);
  });
});
