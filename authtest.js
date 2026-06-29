// tests/auth.test.js

const request = require('supertest');
const app = require('../server');

describe('Authentication & API Key Generation', () => {
  test('New user registration should return a valid API key', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'SecurePass123'
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.user).toHaveProperty('apiKey');
    expect(res.body.user.apiKey).toMatch(/^vl_[a-f0-9]{32}$/);
    expect(res.body.user.usageCount).toBe(0);
    expect(res.body.user.requestLimit).toBe(10);
  });
});
