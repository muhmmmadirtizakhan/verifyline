// tests/validation.test.js

const request = require('supertest');
const app = require('../server');

describe('Phone Number Validation', () => {
  let apiKey;

  beforeAll(async () => {
    const register = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Validation Tester',
        email: 'validate@test.com',
        password: 'test123'
      });
    apiKey = register.body.user.apiKey;
  });

  test('Valid Pakistani number should return carrier and region info', async () => {
    const res = await request(app)
      .post('/api/validate')
      .set('X-API-Key', apiKey)
      .send({ phoneNumber: '+923001234567' });

    expect(res.status).toBe(200);
    expect(res.body.valid).toBe(true);
    expect(res.body.country).toBe('Pakistan');
    expect(res.body.carrier).toBe('Jazz');
    expect(res.body).toHaveProperty('usageLeft');
  });

  test('Invalid prefix should return error', async () => {
    const res = await request(app)
      .post('/api/validate')
      .set('X-API-Key', apiKey)
      .send({ phoneNumber: '+999001234567' });

    expect(res.status).toBe(200);
    expect(res.body.valid).toBe(false);
    expect(res.body.error).toBe('Country prefix not recognized');
  });

  test('Phone number without + should return error', async () => {
    const res = await request(app)
      .post('/api/validate')
      .set('X-API-Key', apiKey)
      .send({ phoneNumber: '923001234567' });

    expect(res.status).toBe(200);
    expect(res.body.valid).toBe(false);
    expect(res.body.error).toBe('Phone number must start with +');
  });
});
