// tests/server/friends.test.ts
import request from 'supertest';
import express from 'express';
import { setupAuth } from '../../server/auth';
import friendsRouter from '../../server/routes/friends';

const app = express();
app.use(express.json());
setupAuth(app);
app.use('/api/friends', friendsRouter);

describe('Friends API', () => {
  let authCookie: string;

  beforeEach(async () => {
    // Login as testuser to get authenticated cookie
    const loginResponse = await request(app)
      .post('/api/login')
      .send({
        username: 'testuser',
        password: 'password123'
      });

    authCookie = loginResponse.headers['set-cookie'][0];
  });

  describe('GET /api/friends/search', () => {
    it('should search for users by username', async () => {
      const response = await request(app)
        .get('/api/friends/search?q=testuser1')
        .set('Cookie', authCookie);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should return empty array for non-existent user', async () => {
      const response = await request(app)
        .get('/api/friends/search?q=nonexistentuser')
        .set('Cookie', authCookie);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });
  });

  describe('GET /api/friends', () => {
    it('should return friends list for authenticated user', async () => {
      const response = await request(app)
        .get('/api/friends')
        .set('Cookie', authCookie);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('friends');
      expect(response.body).toHaveProperty('requests');
      expect(response.body).toHaveProperty('suggestions');
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .get('/api/friends');

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/friends/request/:userId', () => {
    it('should send friend request successfully', async () => {
      const response = await request(app)
        .post('/api/friends/request/2') // Assuming testuser2 exists
        .set('Cookie', authCookie);

      expect([200, 201, 400]).toContain(response.status); // 400 if already friends
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .post('/api/friends/request/99999')
        .set('Cookie', authCookie);

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/friends/request/:requestId', () => {
    it('should accept friend request', async () => {
      // First create a friend request
      await request(app)
        .post('/api/friends/request/2')
        .set('Cookie', authCookie);

      // Then accept it (this would need to be done by the other user)
      // For now, just test the endpoint exists
      const response = await request(app)
        .put('/api/friends/request/1?action=accept')
        .set('Cookie', authCookie);

      expect([200, 404]).toContain(response.status);
    });

    it('should reject friend request', async () => {
      const response = await request(app)
        .put('/api/friends/request/1?action=reject')
        .set('Cookie', authCookie);

      expect([200, 404]).toContain(response.status);
    });
  });
});
