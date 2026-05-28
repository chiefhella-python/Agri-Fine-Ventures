// ============================================
// AUTH API TESTS
// Security-focused unit and integration tests
// ============================================

const request = require('supertest');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const app = require('../server');

const JWT_SECRET = process.env.JWT_SECRET || 'agri-fine-secure-jwt-secret-key-2024-production-ready-token';

// Mock database and bcrypt for testing
jest.mock('../config/database', () => ({
  getUserByEmail: jest.fn(),
  createUser: jest.fn(),
  updateUser: jest.fn(),
  deleteUser: jest.fn(),
  resetUsers: jest.fn(),
  getAllUsers: jest.fn(),
  initializeDatabase: jest.fn().mockResolvedValue(true),
  initializeGreenhouses: jest.fn().mockResolvedValue(true)
}));

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn().mockResolvedValue('hashed-password')
}));

const db = require('../config/database');

describe('Authentication API Security Tests', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Setup default mock returns
    db.getUserByEmail.mockResolvedValue(null);
    db.createUser.mockResolvedValue({
      uid: 'test-uid',
      email: 'test@test.com',
      displayName: 'Test User',
      role: 'user',
      password: 'hashed-password'
    });
    db.getAllUsers.mockResolvedValue([]);

    // Default bcrypt mock
    bcrypt.compare.mockResolvedValue(false);
  });

  describe('POST /api/auth/login', () => {
    test('✅ Valid login credentials should return JWT token', async () => {
      // Mock successful user lookup and password verification
      db.getUserByEmail.mockResolvedValue({
        uid: 'admin-uid',
        email: 'agrifineventures@gmail.com',
        password: 'hashed-password',
        displayName: 'Admin',
        role: 'admin',
        avatar: '👑'
      });
      bcrypt.compare.mockResolvedValue(true); // Password matches

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'agrifineventures@gmail.com',
          password: 'demo_admin'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.role).toBe('admin');

      // Verify JWT token
      const decoded = jwt.verify(response.body.token, JWT_SECRET);
      expect(decoded.uid).toBe('admin-uid');
      expect(decoded.role).toBe('admin');
      expect(decoded.exp).toBeGreaterThan(decoded.iat);
    });

    test('❌ Invalid credentials should return 401', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@test.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid credentials');
      expect(response.body).not.toHaveProperty('token');
    });

    test('❌ SQL injection attempt should be prevented', async () => {
      const sqlInjectionPayloads = [
        { email: "' OR '1'='1", password: "' OR '1'='1" },
        { email: "admin' --", password: "password" },
        { email: "'; DROP TABLE users; --", password: "password" },
        { email: "admin'; SELECT * FROM users; --", password: "password" }
      ];

      for (const payload of sqlInjectionPayloads) {
        const response = await request(app)
          .post('/api/auth/login')
          .send(payload);

        expect(response.status).toBe(401);
        expect(response.body.error).toBe('Invalid credentials');
      }
    });

    test('❌ XSS payload in login should not execute', async () => {
      const xssPayloads = [
        { email: '<script>alert("xss")</script>', password: 'password' },
        { email: 'admin@email.com', password: '<img src=x onerror=alert(1)>' },
        { email: '"><script>alert("xss")</script>', password: 'password' }
      ];

      for (const payload of xssPayloads) {
        const response = await request(app)
          .post('/api/auth/login')
          .send(payload);

        expect(response.status).toBe(401);
        expect(response.body.error).toBe('Invalid credentials');
        // Should not contain script tags in response
        expect(JSON.stringify(response.body)).not.toContain('<script>');
      }
    });

    test('❌ Missing email should return 400', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ password: 'password' });

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });

    test('❌ Missing password should return 400', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@test.com' });

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('POST /api/auth/register', () => {
    test('✅ Valid registration should succeed', async () => {
      const testUser = {
        email: `test${Date.now()}@example.com`,
        password: 'testpass123',
        displayName: 'Test User',
        role: 'supervisor'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(testUser);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user.email).toBe(testUser.email);
    });

    test('❌ Duplicate email should return 400', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'agrifineventures@gmail.com', // Already exists
          password: 'password123',
          displayName: 'Duplicate User',
          role: 'user'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('User already exists');
    });

    test('❌ Invalid role should return 400', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          displayName: 'Test User',
          role: 'invalid_role'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Valid role is required');
    });

    test('❌ Password too short should return 400', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: '123', // Too short
          displayName: 'Test User',
          role: 'user'
        });

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('Authentication Middleware', () => {
    let validToken;

    beforeAll(async () => {
      // Get a valid token
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'agrifineventures@gmail.com',
          password: 'demo_admin'
        });
      validToken = loginRes.body.token;
    });

    test('✅ Valid token should allow access', async () => {
      const response = await request(app)
        .get('/api/auth/users')
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    test('❌ No token should return 401', async () => {
      const response = await request(app)
        .get('/api/auth/users');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('No token provided');
    });

    test('❌ Invalid token should return 401', async () => {
      const response = await request(app)
        .get('/api/auth/users')
        .set('Authorization', 'Bearer invalid.token.here');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid token');
    });

    test('❌ Tampered token should return 401', async () => {
      // Decode and modify token
      const decoded = jwt.verify(validToken, JWT_SECRET);
      decoded.role = 'admin_tampered';

      const tamperedToken = jwt.sign(decoded, 'wrong_secret');

      const response = await request(app)
        .get('/api/auth/users')
        .set('Authorization', `Bearer ${tamperedToken}`);

      expect(response.status).toBe(401);
    });

    test('❌ Expired token should return 401', async () => {
      const expiredPayload = {
        uid: 'test',
        email: 'test@test.com',
        role: 'user',
        iat: Math.floor(Date.now() / 1000) - 3600, // 1 hour ago
        exp: Math.floor(Date.now() / 1000) - 1800  // Expired 30 min ago
      };
      const expiredToken = jwt.sign(expiredPayload, JWT_SECRET);

      const response = await request(app)
        .get('/api/auth/users')
        .set('Authorization', `Bearer ${expiredToken}`);

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Token expired');
    });
  });

  describe('Rate Limiting', () => {
    test('❌ Login rate limiting should work', async () => {
      // Send multiple rapid login attempts
      const promises = [];
      for (let i = 0; i < 10; i++) {
        promises.push(
          request(app)
            .post('/api/auth/login')
            .send({
              email: 'test@test.com',
              password: 'wrongpassword'
            })
        );
      }

      const responses = await Promise.all(promises);

      // At least one should be rate limited
      const rateLimited = responses.some(res => res.status === 429);
      expect(rateLimited).toBe(true);
    });
  });
});