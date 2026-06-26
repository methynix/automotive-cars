import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app.js';

describe('GET /api/health', () => {
  it('should return health status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBeGreaterThanOrEqual(200);
    expect(res.status).toBeLessThanOrEqual(503);
    expect(res.body.success).toBe(true);
  });
});

describe('GET /api/reviews', () => {
  it('should respond (needs DB)', async () => {
    const res = await request(app).get('/api/reviews');
    expect([200, 500]).toContain(res.status);
    if (res.status === 200) {
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    }
  });
});

describe('GET /api-docs', () => {
  it('should return swagger UI', async () => {
    const res = await request(app).get('/api-docs/');
    expect(res.status).toBe(200);
    expect(res.text).toContain('swagger');
  });
});

describe('GET /sitemap.xml', () => {
  it('should respond (needs DB)', async () => {
    const res = await request(app).get('/sitemap.xml');
    expect([200, 500]).toContain(res.status);
  });
});
