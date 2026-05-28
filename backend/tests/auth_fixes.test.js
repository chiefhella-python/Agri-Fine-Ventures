// Test script to verify authorization fixes
const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../server');

const JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key-for-testing-only';

describe('Authorization Fixes Verification', () => {
  let adminToken, supervisorToken, userToken, supervisor2Token;
  let testGreenhouseId;
  
  beforeAll(async () => {
    // Create admin user (already exists)
    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'agrifineventures@gmail.com',
        password: '1234' // Default admin password from database init
      });
    adminToken = adminLogin.body.token;
    
    // Create supervisor 1
    const supervisor1Email = `supervisor1${Date.now()}@test.com`;
    await request(app)
      .post('/api/auth/register')
      .send({
        email: supervisor1Email,
        password: 'supervisor123',
        displayName: 'Test Supervisor 1',
        role: 'supervisor'
      });
    
    const supervisor1Login = await request(app)
      .post('/api/auth/login')
      .send({
        email: supervisor1Email,
        password: 'supervisor123'
      });
    supervisorToken = supervisor1Login.body.token;
    
    // Create supervisor 2 (for testing unassigned access)
    const supervisor2Email = `supervisor2${Date.now()}@test.com`;
    await request(app)
      .post('/api/auth/register')
      .send({
        email: supervisor2Email,
        password: 'supervisor123',
        displayName: 'Test Supervisor 2',
        role: 'supervisor'
      });
    
    const supervisor2Login = await request(app)
      .post('/api/auth/login')
      .send({
        email: supervisor2Email,
        password: 'supervisor123'
      });
    supervisor2Token = supervisor2Login.body.token;
    
    // Create regular user
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
    userToken = userLogin.body.token;
    
    // Create a test greenhouse as admin
    const greenhouseRes = await request(app)
      .post('/api/greenhouses')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Test Greenhouse',
        crop: 'Tomatoes',
        plants: 100
      });
    testGreenhouseId = greenhouseRes.body.id;
    
    // Assign greenhouse to supervisor 1
    await request(app)
      .put(`/api/auth/users/${supervisor1Login.body.uid}/greenhouses`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        greenhouseIds: [testGreenhouseId]
      });
  });
  
  test('✅ Admin can access all greenhouses', async () => {
    const response = await request(app)
      .get('/api/greenhouses')
      .set('Authorization', `Bearer ${adminToken}`);
    
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });
  
  test('✅ Supervisor can access assigned greenhouse', async () => {
    const response = await request(app)
      .get(`/api/greenhouses/${testGreenhouseId}`)
      .set('Authorization', `Bearer ${supervisorToken}`);
    
    expect(response.status).toBe(200);
    expect(response.body.id).toBe(testGreenhouseId);
  });
  
  test('❌ Supervisor cannot access unassigned greenhouse', async () => {
    // Create another greenhouse not assigned to supervisor 1
    const otherGreenhouseRes = await request(app)
      .post('/api/greenhouses')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Other Greenhouse',
        crop: 'Cucumbers',
        plants: 50
      });
    const otherGreenhouseId = otherGreenhouseRes.body.id;
    
    const response = await request(app)
      .get(`/api/greenhouses/${otherGreenhouseId}`)
      .set('Authorization', `Bearer ${supervisorToken}`);
    
    expect(response.status).toBe(403);
    expect(response.body.error).toBe('Access denied to this greenhouse');
  });
  
  test('❌ Supervisor 2 cannot access supervisor 1\'s greenhouse (no assignment)', async () => {
    const response = await request(app)
      .get(`/api/greenhouses/${testGreenhouseId}`)
      .set('Authorization', `Bearer ${supervisor2Token}`);
    
    expect(response.status).toBe(403);
    expect(response.body.error).toBe('Access denied to this greenhouse');
  });
  
  test('❌ Regular user cannot access greenhouse endpoints', async () => {
    const response = await request(app)
      .get('/api/greenhouses')
      .set('Authorization', `Bearer ${userToken}`);
    
    expect(response.status).toBe(403);
    expect(response.body.error).toBe('Access denied');
  });
  
  test('✅ Supervisor can create greenhouse (admin only now - supervisors restricted)', async () => {
    // This should now fail since we changed it to admin only
    const response = await request(app)
      .post('/api/greenhouses')
      .set('Authorization', `Bearer ${supervisorToken}`)
      .send({
        name: 'New Greenhouse',
        crop: 'Peppers',
        plants: 75
      });
    
    expect(response.status).toBe(403); // Should be forbidden now
    expect(response.body.error).toBe('Access denied');
  });
  
  test('✅ Admin can create greenhouse', async () => {
    const response = await request(app)
      .post('/api/greenhouses')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Admin Greenhouse',
        crop: 'Lettuce',
        plants: 200
      });
    
    expect(response.status).toBe(201);
    expect(response.body.name).toBe('Admin Greenhouse');
  });
  
  test('✅ Input validation works - invalid greenhouse data', async () => {
    const response = await request(app)
      .post('/api/greenhouses')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: '', // Empty name should fail validation
        crop: 'Tomatoes',
        plants: -5 // Negative plants should fail
      });
    
    expect(response.status).toBe(400);
    expect(response.body.errors).toBeDefined();
  });
  
  test('✅ Sensor endpoint authorization works', async () => {
    // Supervisor 1 should be able to access their greenhouse sensors
    let response = await request(app)
      .get(`/api/sensors/${testGreenhouseId}`)
      .set('Authorization', `Bearer ${supervisorToken}`);
    
    expect(response.status).toBe(200);
    
    // Supervisor 2 should NOT be able to access supervisor 1's greenhouse sensors
    response = await request(app)
      .get(`/api/sensors/${testGreenhouseId}`)
      .set('Authorization', `Bearer ${supervisor2Token}`);
    
    expect(response.status).toBe(403);
  });
});

console.log('Test file created. To run: npx jest test_auth_fixes.js');