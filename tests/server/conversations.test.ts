// tests/server/conversations.test.ts
import request from 'supertest';
import express from 'express';
import { setupAuth } from '../../server/auth';

const app = express();
app.use(express.json());
setupAuth(app);

// Mock conversation routes (would need to be implemented in routes.ts)
app.get('/api/conversations', async (req, res) => {
  // Mock implementation
  res.json([
    {
      id: 1,
      participants: [{ id: 1, username: 'testuser' }, { id: 2, username: 'testuser2' }],
      lastMessage: { content: 'Hello', timestamp: new Date() }
    }
  ]);
});

app.post('/api/conversations', async (req, res) => {
  // Mock implementation
  res.status(201).json({ id: 1, createdAt: new Date() });
});

app.get('/api/conversations/:id/messages', async (req, res) => {
  // Mock implementation
  res.json([
    { id: 1, content: 'Test message', senderId: 1, timestamp: new Date() }
  ]);
});

app.post('/api/conversations/:id/messages', async (req, res) => {
  // Mock implementation
  res.status(201).json({ id: 1, ...req.body });
});

describe('Conversations API', () => {
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

  describe('GET /api/conversations', () => {
    it('should return user conversations', async () => {
      const response = await request(app)
        .get('/api/conversations')
        .set('Cookie', authCookie);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .get('/api/conversations');

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/conversations', () => {
    it('should create a new conversation', async () => {
      const newConversation = {
        participantIds: [2] // testuser2
      };

      const response = await request(app)
        .post('/api/conversations')
        .set('Cookie', authCookie)
        .send(newConversation);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .post('/api/conversations')
        .send({ participantIds: [2] });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/conversations/:id/messages', () => {
    it('should return conversation messages', async () => {
      const response = await request(app)
        .get('/api/conversations/1/messages')
        .set('Cookie', authCookie);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .get('/api/conversations/1/messages');

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/conversations/:id/messages', () => {
    it('should send a message in conversation', async () => {
      const newMessage = {
        content: 'Hello from test!'
      };

      const response = await request(app)
        .post('/api/conversations/1/messages')
        .set('Cookie', authCookie)
        .send(newMessage);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.content).toBe(newMessage.content);
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .post('/api/conversations/1/messages')
        .send({ content: 'Hello' });

      expect(response.status).toBe(401);
    });
  });
});
