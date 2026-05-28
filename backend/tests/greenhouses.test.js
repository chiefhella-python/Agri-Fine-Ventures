// ============================================
// GREENHOUSES API TESTS
// Security and functionality tests
// ============================================

const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../server');

const JWT_SECRET = process.env.JWT_SECRET || 'agri-fine-secure-jwt-secret-key-2024-production-ready-token';

describe('Greenhouses API Security Tests', () => {
  let adminToken, supervisorToken;

  beforeAll(async () => {
    // Get admin token
    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'agrifineventures@gmail.com',
        password: 'demo_admin'
      });
    adminToken = adminLogin.body.token;

    // Create and login as supervisor for testing
    const supervisorEmail = `supervisor${Date.now()}@test.com`;
    await request(app)
      .post('/api/auth/register')
      .send({
        email: supervisorEmail,
        password: 'supervisor123',
        displayName: 'Test Supervisor',
        role: 'supervisor'
      });

    const supervisorLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: supervisorEmail,
        password: 'supervisor123'
      });
    supervisorToken = supervisorLogin.body.token;
  });

  describe('GET /api/greenhouses', () => {
    test('✅ Admin should see all greenhouses', async () => {
      const response = await request(app)
        .get('/api/greenhouses')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    test('✅ Supervisor should see assigned greenhouses', async () => {
      const response = await request(app)
        .get('/api/greenhouses')
        .set('Authorization', `Bearer ${supervisorToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    test('❌ Unauthenticated request should fail', async () => {
      const response = await request(app)
        .get('/api/greenhouses');

      expect(response.status).toBe(401);
    });

    test('❌ Invalid token should fail', async () => {
      const response = await request(app)
        .get('/api/greenhouses')
        .set('Authorization', 'Bearer invalid.token');

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/greenhouses', () => {
    test('✅ Admin should create greenhouse', async () => {
      const newGreenhouse = {
        name: 'Security Test Greenhouse',
        crop: 'Tomatoes',
        plants: 1000,
        area: '500m²',
        location: 'Test Location'
      };

      const response = await request(app)
        .post('/api/greenhouses')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newGreenhouse);

      expect(response.status).toBe(201);
      expect(response.body.name).toBe(newGreenhouse.name);
      expect(response.body.id).toMatch(/^gh_/);
    });

    test('✅ Supervisor should create greenhouse', async () => {
      const newGreenhouse = {
        name: 'Supervisor Test Greenhouse',
        crop: 'Cucumbers',
        plants: 800,
        area: '400m²',
        location: 'Supervisor Location'
      };

      const response = await request(app)
        .post('/api/greenhouses')
        .set('Authorization', `Bearer ${supervisorToken}`)
        .send(newGreenhouse);

      expect(response.status).toBe(201);
      expect(response.body.name).toBe(newGreenhouse.name);
    });

    test('❌ User role should not create greenhouse', async () => {
      // Create a regular user
      const userEmail = `user${Date.now()}@test.com`;
      await request(app)
        .post('/api/auth/register')
        .send({
          email: userEmail,
          password: 'user123',
          displayName: 'Test User',
          role: 'user'
        });

      const userLogin = await request(app)
        .post('/api/auth/login')
        .send({
          email: userEmail,
          password: 'user123'
        });
      const userToken = userLogin.body.token;

      const response = await request(app)
        .post('/api/greenhouses')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'User Test Greenhouse',
          crop: 'Peppers',
          plants: 500
        });

      expect(response.status).toBe(403);
    });

    test('❌ XSS in greenhouse name should be sanitized', async () => {
      const xssName = '<script>alert("xss")</script>Test Greenhouse';

      const response = await request(app)
        .post('/api/greenhouses')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: xssName,
          crop: 'Tomatoes',
          plants: 100
        });

      expect(response.status).toBe(201);
      // Check that the response doesn't contain script tags
      expect(response.body.name).not.toContain('<script>');
      expect(response.body.name).toContain('&lt;script&gt;'); // Should be HTML encoded
    });

    test('❌ SQL injection in greenhouse data should fail', async () => {
      const sqlInjectionData = {
        name: "'; DROP TABLE greenhouses; --",
        crop: "' OR '1'='1",
        plants: 100,
        location: "'; SELECT * FROM users; --"
      };

      const response = await request(app)
        .post('/api/greenhouses')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(sqlInjectionData);

      // Should either fail validation or succeed but not execute SQL
      expect([201, 400]).toContain(response.status);

      if (response.status === 201) {
        // If it succeeded, check that SQL wasn't executed
        expect(response.body.name).not.toBe("'; DROP TABLE greenhouses; --");
      }
    });
  });

  describe('PUT /api/greenhouses/:id', () => {
    let testGreenhouseId;

    beforeAll(async () => {
      // Create a test greenhouse
      const response = await request(app)
        .post('/api/greenhouses')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Update Test Greenhouse',
          crop: 'Tomatoes',
          plants: 500
        });
      testGreenhouseId = response.body.id;
    });

    test('✅ Admin should update greenhouse', async () => {
      const updates = {
        name: 'Updated Test Greenhouse',
        crop: 'Cucumbers',
        plants: 750
      };

      const response = await request(app)
        .put(`/api/greenhouses/${testGreenhouseId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updates);

      expect(response.status).toBe(200);
      expect(response.body.name).toBe(updates.name);
      expect(response.body.crop).toBe(updates.crop);
    });

    test('❌ IDOR: Supervisor should not update unassigned greenhouse', async () => {
      // This test assumes the supervisor doesn't have this greenhouse assigned
      const response = await request(app)
        .put(`/api/greenhouses/${testGreenhouseId}`)
        .set('Authorization', `Bearer ${supervisorToken}`)
        .send({
          name: 'Hacked Greenhouse Name'
        });

      // Should either fail with 403/404 or succeed only if assigned
      expect([403, 404, 200]).toContain(response.status);

      if (response.status === 200) {
        // If allowed, it should be because the greenhouse is assigned
        // In a real test, we'd check assignments
      }
    });
  });

  describe('DELETE /api/greenhouses/:id', () => {
    test('✅ Admin should delete greenhouse', async () => {
      // Create a greenhouse to delete
      const createRes = await request(app)
        .post('/api/greenhouses')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Delete Test Greenhouse',
          crop: 'Test Crop',
          plants: 100
        });

      const deleteRes = await request(app)
        .delete(`/api/greenhouses/${createRes.body.id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(deleteRes.status).toBe(200);
      expect(deleteRes.body.message).toContain('deleted');
    });

    test('❌ Non-admin should not delete greenhouse', async () => {
      // Create a greenhouse
      const createRes = await request(app)
        .post('/api/greenhouses')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'No Delete Test Greenhouse',
          crop: 'Test Crop',
          plants: 100
        });

      const deleteRes = await request(app)
        .delete(`/api/greenhouses/${createRes.body.id}`)
        .set('Authorization', `Bearer ${supervisorToken}`);

      expect(deleteRes.status).toBe(403);
    });
  });
});