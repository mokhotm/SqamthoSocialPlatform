// tests/server/auth.test.ts
import request from 'supertest';
import express from 'express';
import { setupAuth } from '../../server/auth';
import { storage } from '../../server/storage';

const app = express();
app.use(express.json());
setupAuth(app);

describe('Authentication API', () => {
  beforeEach(async () => {
    // Clear any existing sessions
    // Reset database state if needed
  });

  describe('POST /api/login', () => {
    it('should login with valid test user credentials', async () => {
      const response = await request(app)
        .post('/api/login')
        .send({
          username: 'testuser',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('username');
      expect(response.body).not.toHaveProperty('password');
      expect(response.body).not.toHaveProperty('password_hash');
    });

    it('should reject login with invalid credentials', async () => {
      const response = await request(app)
        .post('/api/login')
        .send({
          username: 'testuser',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message');
    });

    it('should reject login with non-existent user', async () => {
      const response = await request(app)
        .post('/api/login')
        .send({
          username: 'nonexistent',
          password: 'password123'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('POST /api/register', () => {
    it('should register a new user successfully', async () => {
      const newUser = {
        username: `testuser${Date.now()}`,
        displayName: 'Test User',
        email: `test${Date.now()}@example.com`,
        password: 'password123',
        bio: 'Test bio',
        profilePicture: 'https://example.com/avatar.jpg',
        location: 'Test City'
      };

      const response = await request(app)
        .post('/api/register')
        .send(newUser);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.username).toBe(newUser.username);
      expect(response.body.email).toBe(newUser.email);
    });

    it('should reject registration with existing username', async () => {
      const response = await request(app)
        .post('/api/register')
        .send({
          username: 'testuser',
          displayName: 'Test User',
          email: 'test@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('POST /api/logout', () => {
    it('should logout successfully', async () => {
      // First login
      const loginResponse = await request(app)
        .post('/api/login')
        .send({
          username: 'testuser',
          password: 'password123'
        });

      const cookie = loginResponse.headers['set-cookie'];

      const response = await request(app)
        .post('/api/logout')
        .set('Cookie', cookie);

      expect(response.status).toBe(200);
    });
  });

  describe('GET /api/user', () => {
    it('should return user data when authenticated', async () => {
      // First login
      const loginResponse = await request(app)
        .post('/api/login')
        .send({
          username: 'testuser',
          password: 'password123'
        });

      const cookie = loginResponse.headers['set-cookie'];

      const response = await request(app)
        .get('/api/user')
        .set('Cookie', cookie);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('username');
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .get('/api/user');

      expect(response.status).toBe(401);
    });
  });
});
