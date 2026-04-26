// tests/server/posts.test.ts
import request from 'supertest';
import express from 'express';
import { setupAuth } from '../../server/auth';

const app = express();
app.use(express.json());
setupAuth(app);

// Mock routes for posts (would need to be implemented in routes.ts)
app.post('/api/posts', async (req, res) => {
  // Mock implementation for testing
  res.status(201).json({ id: 1, ...req.body });
});

app.get('/api/posts', async (req, res) => {
  // Mock implementation for testing
  res.json([{ id: 1, content: 'Test post', userId: 1 }]);
});

describe('Posts API', () => {
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

  describe('POST /api/posts', () => {
    it('should create a new post successfully', async () => {
      const newPost = {
        content: 'This is a test post',
        imageUrl: 'https://example.com/image.jpg'
      };

      const response = await request(app)
        .post('/api/posts')
        .set('Cookie', authCookie)
        .send(newPost);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.content).toBe(newPost.content);
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .post('/api/posts')
        .send({
          content: 'This is a test post'
        });

      expect(response.status).toBe(401);
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/posts')
        .set('Cookie', authCookie)
        .send({}); // Empty body

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/posts', () => {
    it('should return posts list', async () => {
      const response = await request(app)
        .get('/api/posts')
        .set('Cookie', authCookie);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should work without authentication for public posts', async () => {
      const response = await request(app)
        .get('/api/posts');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('GET /api/posts/:id', () => {
    it('should return specific post', async () => {
      const response = await request(app)
        .get('/api/posts/1')
        .set('Cookie', authCookie);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id');
    });

    it('should return 404 for non-existent post', async () => {
      const response = await request(app)
        .get('/api/posts/99999')
        .set('Cookie', authCookie);

      expect(response.status).toBe(404);
    });
  });
});
