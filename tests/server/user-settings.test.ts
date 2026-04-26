// tests/server/user-settings.test.ts
import request from 'supertest';
import express from 'express';
import { setupAuth } from '../../server/auth';

const app = express();
app.use(express.json());
setupAuth(app);

// Mock user settings routes (would need to be implemented in routes.ts)
app.get('/api/user/settings', async (req, res) => {
  // Mock implementation
  res.json({
    id: 1,
    userId: 1,
    theme: 'dark',
    language: 'en',
    notifications: true,
    privacy: 'public'
  });
});

app.put('/api/user/settings', async (req, res) => {
  // Mock implementation
  res.json({ id: 1, ...req.body });
});

describe('User Settings API', () => {
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

  describe('GET /api/user/settings', () => {
    it('should return user settings', async () => {
      const response = await request(app)
        .get('/api/user/settings')
        .set('Cookie', authCookie);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('userId');
      expect(response.body).toHaveProperty('theme');
      expect(response.body).toHaveProperty('language');
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .get('/api/user/settings');

      expect(response.status).toBe(401);
    });
  });

  describe('PUT /api/user/settings', () => {
    it('should update user settings', async () => {
      const updatedSettings = {
        theme: 'light',
        language: 'es',
        notifications: false
      };

      const response = await request(app)
        .put('/api/user/settings')
        .set('Cookie', authCookie)
        .send(updatedSettings);

      expect(response.status).toBe(200);
      expect(response.body.theme).toBe(updatedSettings.theme);
      expect(response.body.language).toBe(updatedSettings.language);
      expect(response.body.notifications).toBe(updatedSettings.notifications);
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .put('/api/user/settings')
        .send({ theme: 'light' });

      expect(response.status).toBe(401);
    });
  });
});
