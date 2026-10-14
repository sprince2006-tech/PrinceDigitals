const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const bcrypt = require('bcryptjs');

let mongoServer;
let app;
let adminCookie;
let adminToken;

const TEST_ADMIN_USER = 'testadmin';
const TEST_ADMIN_PASS = 'SecretPass123!';

describe('Prince Digital API Test Suite', () => {
  before(async () => {
    // 1. Setup in-memory MongoDB
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    process.env.MONGODB_URI = uri;
    process.env.NODE_ENV = 'test';
    process.env.SESSION_SECRET = 'test-session-secret-key-1234567890';
    process.env.ADMIN_EMAIL = 'admin@princedigital.com';
    process.env.ADMIN_USERNAME = TEST_ADMIN_USER;
    process.env.ADMIN_PASSWORD_HASH = bcrypt.hashSync(TEST_ADMIN_PASS, 10);

    // Connect mongoose
    await mongoose.connect(uri);

    // Require app after env is loaded
    app = require('../src/app');
  });

  after(async () => {
    await mongoose.disconnect();
    if (mongoServer) {
      await mongoServer.stop();
    }
  });

  test('GET /health returns healthy status', async () => {
    const res = await request(app).get('/health');
    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'healthy');
  });

  test('Public catalog: returns empty list when no published collections exist', async () => {
    const res = await request(app).get('/api/v1/collections');
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.deepEqual(res.body.data, []);
  });

  test('Admin routes reject unauthenticated requests with 401', async () => {
    const res = await request(app).get('/api/v1/admin/dashboard');
    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
  });

  test('Admin login: fails with invalid credentials', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ username: TEST_ADMIN_USER, password: 'WrongPassword' });

    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
  });

  test('Admin login: succeeds with valid credentials and sets HTTP-only cookie', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ username: TEST_ADMIN_USER, password: TEST_ADMIN_PASS });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.token);

    adminToken = res.body.data.token;

    // Verify Set-Cookie header contains prince_admin_token and HttpOnly
    const cookies = res.headers['set-cookie'];
    assert.ok(cookies);
    const authCookie = cookies.find((c) => c.includes('prince_admin_token'));
    assert.ok(authCookie);
    assert.ok(authCookie.includes('HttpOnly'));
    adminCookie = authCookie.split(';')[0];
  });

  test('GET /api/v1/auth/me returns authenticated status with cookie', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Cookie', adminCookie);

    assert.equal(res.status, 200);
    assert.equal(res.body.data.authenticated, true);
    assert.equal(res.body.data.admin.role, 'admin');
  });

  let createdCollectionId;
  let createdCollectionSlug;

  test('Admin: create published collection and unpublished draft collection', async () => {
    // 1. Published collection
    const pubRes = await request(app)
      .post('/api/v1/admin/collections')
      .set('Cookie', adminCookie)
      .send({
        title: 'Peak Formals',
        description: 'Luxury tailored suits and formal wear',
        coverImageUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35',
        coverImagePublicId: 'sample_cover_1',
        isPublished: true,
      });

    assert.equal(pubRes.status, 201);
    assert.equal(pubRes.body.data.title, 'Peak Formals');
    assert.equal(pubRes.body.data.slug, 'peak-formals');
    assert.equal(pubRes.body.data.isPublished, true);
    createdCollectionId = pubRes.body.data._id;
    createdCollectionSlug = pubRes.body.data.slug;

    // 2. Draft collection
    const draftRes = await request(app)
      .post('/api/v1/admin/collections')
      .set('Cookie', adminCookie)
      .send({
        title: 'Secret Draft Collection',
        description: 'Not published yet',
        coverImageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf',
        coverImagePublicId: 'sample_draft',
        isPublished: false,
      });

    assert.equal(draftRes.status, 201);
    assert.equal(draftRes.body.data.isPublished, false);
  });

  test('Public catalog: exposes ONLY published collection', async () => {
    const res = await request(app).get('/api/v1/collections');
    assert.equal(res.status, 200);
    assert.equal(res.body.data.length, 1);
    assert.equal(res.body.data[0].slug, 'peak-formals');
  });

  test('Admin: creates products inside published collection and enforces URL validation', async () => {
    // Invalid URL should fail
    const invalidUrlRes = await request(app)
      .post(`/api/v1/admin/collections/${createdCollectionId}/products`)
      .set('Cookie', adminCookie)
      .send({
        title: 'Invalid URL Product',
        productUrl: 'javascript:alert(1)',
        imageUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35',
        isPublished: true,
      });

    assert.equal(invalidUrlRes.status, 400);

    // Valid product 1
    const validProd1 = await request(app)
      .post(`/api/v1/admin/collections/${createdCollectionId}/products`)
      .set('Cookie', adminCookie)
      .send({
        title: 'Italian Wool Blazer',
        description: 'Premium tailored blazer in navy blue',
        productUrl: 'https://www.amazon.com/dp/B08XYZ1234',
        imageUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35',
        coverImagePublicId: 'prod_1',
        isPublished: true,
      });

    assert.equal(validProd1.status, 201);
    assert.equal(validProd1.body.data.productUrl, 'https://www.amazon.com/dp/B08XYZ1234');

    // Valid product 2 (Unpublished)
    const validProd2 = await request(app)
      .post(`/api/v1/admin/collections/${createdCollectionId}/products`)
      .set('Cookie', adminCookie)
      .send({
        title: 'Unpublished Silk Tie',
        productUrl: 'https://example.com/tie',
        imageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf',
        isPublished: false,
      });

    assert.equal(validProd2.status, 201);
  });

  test('Public collection detail: shows published collection and only published products', async () => {
    const res = await request(app).get(`/api/v1/collections/${createdCollectionSlug}`);
    assert.equal(res.status, 200);
    assert.equal(res.body.data.collection.title, 'Peak Formals');
    // Only 1 published product should be returned
    assert.equal(res.body.data.products.length, 1);
    assert.equal(res.body.data.products[0].title, 'Italian Wool Blazer');
    assert.equal(res.body.data.products[0].productUrl, 'https://www.amazon.com/dp/B08XYZ1234');
  });

  test('Public collection detail: unpublished collection returns 404', async () => {
    const res = await request(app).get('/api/v1/collections/secret-draft-collection');
    assert.equal(res.status, 404);
  });

  test('Admin dashboard stats: returns correct statistics', async () => {
    const res = await request(app)
      .get('/api/v1/admin/dashboard')
      .set('Cookie', adminCookie);

    assert.equal(res.status, 200);
    assert.equal(res.body.data.stats.totalCollections, 2);
    assert.equal(res.body.data.stats.publishedCollections, 1);
    assert.equal(res.body.data.stats.draftCollections, 1);
    assert.equal(res.body.data.stats.totalProducts, 2);
    assert.equal(res.body.data.stats.publishedProducts, 1);
  });

  test('Admin logout: clears cookie', async () => {
    const res = await request(app)
      .post('/api/v1/auth/logout')
      .set('Cookie', adminCookie);

    assert.equal(res.status, 200);
    const cookies = res.headers['set-cookie'];
    assert.ok(cookies);
    const authCookie = cookies.find((c) => c.includes('prince_admin_token'));
    assert.ok(authCookie.includes('prince_admin_token=;'));
  });
});
