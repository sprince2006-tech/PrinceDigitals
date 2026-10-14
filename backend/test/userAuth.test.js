const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const bcrypt = require('bcryptjs');

let mongoServer;
let app;

const TEST_ADMIN_EMAIL = 'admin@princedigital.com';
const TEST_ADMIN_USER = 'princeadmin';
const TEST_ADMIN_PASS = 'AdminPassword123!';

describe('User Registration & Role-Based Auth Suite', () => {
  before(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    process.env.MONGODB_URI = uri;
    process.env.NODE_ENV = 'test';
    process.env.SESSION_SECRET = 'secure-test-session-secret-key-987654321';
    process.env.ADMIN_EMAIL = TEST_ADMIN_EMAIL;
    process.env.ADMIN_USERNAME = TEST_ADMIN_USER;
    process.env.ADMIN_PASSWORD_HASH = bcrypt.hashSync(TEST_ADMIN_PASS, 10);

    await mongoose.connect(uri);
    app = require('../src/app');
  });

  after(async () => {
    await mongoose.disconnect();
    if (mongoServer) {
      await mongoServer.stop();
    }
  });

  test('Public registration: normal user can sign up with name, email, and password', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Jane Shopper',
        email: 'jane@example.com',
        password: 'shopperpassword123',
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.role, 'user');
    assert.equal(res.body.data.user.name, 'Jane Shopper');
    assert.equal(res.body.data.user.email, 'jane@example.com');
    assert.ok(res.body.data.token);

    // Verify cookies set
    const cookies = res.headers['set-cookie'];
    assert.ok(cookies);
    assert.ok(cookies.some((c) => c.includes('prince_auth_token')));
  });

  test('Public registration: rejects duplicate email registration', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Jane Clone',
        email: 'jane@example.com',
        password: 'shopperpassword123',
      });

    assert.equal(res.status, 409);
    assert.equal(res.body.success, false);
  });

  test('Public registration: strictly forbids registering as ADMIN_EMAIL', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Imposter Admin',
        email: TEST_ADMIN_EMAIL,
        password: 'password12345',
      });

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.ok(res.body.message.includes('reserved for administration'));
  });

  test('Public registration: validates password minimum length', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Short Pass User',
        email: 'short@example.com',
        password: '123',
      });

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
  });

  test('Login: normal user logs in and receives user role', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'jane@example.com',
        password: 'shopperpassword123',
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.role, 'user');
    assert.equal(res.body.data.user.email, 'jane@example.com');
  });

  test('Login: admin logs in and receives admin role', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: TEST_ADMIN_EMAIL,
        password: TEST_ADMIN_PASS,
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.role, 'admin');
    assert.ok(res.body.data.admin);
  });

  test('Security: normal authenticated user is strictly blocked (403 Forbidden) from admin APIs', async () => {
    // 1. Log in as normal user
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'jane@example.com',
        password: 'shopperpassword123',
      });

    const userToken = loginRes.body.data.token;
    assert.ok(userToken);

    // 2. Try to access admin dashboard
    const dashRes = await request(app)
      .get('/api/v1/admin/dashboard')
      .set('Authorization', `Bearer ${userToken}`);

    assert.equal(dashRes.status, 403);
    assert.equal(dashRes.body.success, false);
    assert.ok(dashRes.body.message.includes('Forbidden'));

    // 3. Try to access admin collections
    const colRes = await request(app)
      .get('/api/v1/admin/collections')
      .set('Authorization', `Bearer ${userToken}`);

    assert.equal(colRes.status, 403);
    assert.equal(colRes.body.success, false);
  });

  test('Security: admin authenticated user can access admin APIs', async () => {
    const adminLoginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: TEST_ADMIN_EMAIL,
        password: TEST_ADMIN_PASS,
      });

    const adminToken = adminLoginRes.body.data.token;
    assert.ok(adminToken);

    const dashRes = await request(app)
      .get('/api/v1/admin/dashboard')
      .set('Authorization', `Bearer ${adminToken}`);

    assert.equal(dashRes.status, 200);
    assert.equal(dashRes.body.success, true);
  });

  test('Session verification: GET /api/v1/auth/me accurately identifies user role', async () => {
    const userLoginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'jane@example.com',
        password: 'shopperpassword123',
      });

    const userCookie = userLoginRes.headers['set-cookie'].find((c) => c.includes('prince_auth_token'));

    const meRes = await request(app)
      .get('/api/v1/auth/me')
      .set('Cookie', userCookie);

    assert.equal(meRes.status, 200);
    assert.equal(meRes.body.data.authenticated, true);
    assert.equal(meRes.body.data.role, 'user');
    assert.equal(meRes.body.data.admin, null);
  });
});
