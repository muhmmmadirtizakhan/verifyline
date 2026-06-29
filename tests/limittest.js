// tests/limit.test.js

const request = require('supertest');
const app = require('../server');

describe('Usage Limit Enforcement', () => {
  let apiKey;

  beforeAll(async () => {
    const register = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Limit Tester',
        email: 'limit@test.com',
        password: 'test123'
      });
    apiKey = register.body.user.apiKey;
  });

  test('10th request should succeed', async () => {
    for (let i = 0; i < 9; i++) {
      await request(app)
        .post('/api/validate')
        .set('X-API-Key', apiKey)
        .send({ phoneNumber: '+923001234567' });
    }

    const res = await request(app)
      .post('/api/validate')
      .set('X-API-Key', apiKey)
      .send({ phoneNumber: '+923001234567' });

    expect(res.status).toBe(200);
    expect(res.body.usageLeft).toBe(0);
  });

  test('11th request should be rejected with 429', async () => {
    const res = await request(app)
      .post('/api/validate')
      .set('X-API-Key', apiKey)
      .send({ phoneNumber: '+923001234567' });

    expect(res.status).toBe(429);
    expect(res.body.error).toBe('Usage limit exceeded');
    expect(res.body.used).toBe(10);
    expect(res.body.limit).toBe(10);
  });
});
