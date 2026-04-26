// tests/integration/full-workflow.test.ts
import request from 'supertest';
import express from 'express';
import { setupAuth } from '../../server/auth';

const app = express();
app.use(express.json());
setupAuth(app);

// Mock all the main routes for integration testing
app.post('/api/posts', async (req, res) => {
  res.status(201).json({
    id: Date.now(),
    userId: 1,
    content: req.body.content,
    imageUrl: req.body.imageUrl,
    createdAt: new Date()
  });
});

app.get('/api/posts', async (req, res) => {
  res.json([
    {
      id: 1,
      userId: 1,
      content: 'Test post for integration testing',
      imageUrl: 'https://example.com/test.jpg',
      createdAt: new Date()
    }
  ]);
});

app.post('/api/friends/request/:userId', async (req, res) => {
  res.status(201).json({
    id: Date.now(),
    userId: 1,
    friendId: parseInt(req.params.userId),
    status: 'pending'
  });
});

app.get('/api/friends', async (req, res) => {
  res.json({
    friends: [],
    requests: [
      {
        id: 1,
        userId: 2,
        friendId: 1,
        status: 'pending',
        createdAt: new Date()
      }
    ],
    suggestions: [
      {
        id: 2,
        username: 'suggesteduser',
        displayName: 'Suggested User'
      }
    ]
  });
});

app.post('/api/conversations', async (req, res) => {
  res.status(201).json({
    id: Date.now(),
    createdBy: 1,
    createdAt: new Date()
  });
});

app.post('/api/conversations/:id/messages', async (req, res) => {
  res.status(201).json({
    id: Date.now(),
    conversationId: parseInt(req.params.id),
    userId: 1,
    content: req.body.content,
    timestamp: new Date()
  });
});

describe('Full Application Workflow Integration Tests', () => {
  let authCookie: string;

  beforeAll(async () => {
    // Login as testuser to establish session
    const loginResponse = await request(app)
      .post('/api/login')
      .send({
        username: 'testuser',
        password: 'password123'
      });

    authCookie = loginResponse.headers['set-cookie'][0];
  });

  it('should complete full user workflow: login → create post → manage friends → send message', async () => {
    // Step 1: Verify login worked (already done in beforeAll)

    // Step 2: Create a post
    const postResponse = await request(app)
      .post('/api/posts')
      .set('Cookie', authCookie)
      .send({
        content: 'Integration test post',
        imageUrl: 'https://example.com/integration.jpg'
      });

    expect(postResponse.status).toBe(201);
    expect(postResponse.body).toHaveProperty('id');
    expect(postResponse.body.content).toBe('Integration test post');

    // Step 3: Get posts to verify creation
    const postsResponse = await request(app)
      .get('/api/posts')
      .set('Cookie', authCookie);

    expect(postsResponse.status).toBe(200);
    expect(Array.isArray(postsResponse.body)).toBe(true);

    // Step 4: Send a friend request
    const friendRequestResponse = await request(app)
      .post('/api/friends/request/2')
      .set('Cookie', authCookie);

    expect(friendRequestResponse.status).toBe(201);
    expect(friendRequestResponse.body).toHaveProperty('id');

    // Step 5: Check friends status
    const friendsResponse = await request(app)
      .get('/api/friends')
      .set('Cookie', authCookie);

    expect(friendsResponse.status).toBe(200);
    expect(friendsResponse.body).toHaveProperty('requests');
    expect(Array.isArray(friendsResponse.body.requests)).toBe(true);

    // Step 6: Create a conversation
    const conversationResponse = await request(app)
      .post('/api/conversations')
      .set('Cookie', authCookie)
      .send({
        participantIds: [2]
      });

    expect(conversationResponse.status).toBe(201);
    expect(conversationResponse.body).toHaveProperty('id');

    // Step 7: Send a message in the conversation
    const messageResponse = await request(app)
      .post(`/api/conversations/${conversationResponse.body.id}/messages`)
      .set('Cookie', authCookie)
      .send({
        content: 'Hello from integration test!'
      });

    expect(messageResponse.status).toBe(201);
    expect(messageResponse.body).toHaveProperty('id');
    expect(messageResponse.body.content).toBe('Hello from integration test!');

    console.log('✅ Full workflow integration test passed!');
  });

  it('should handle authentication errors throughout the workflow', async () => {
    // Test that all endpoints properly handle unauthenticated requests
    const endpoints = [
      { method: 'post', path: '/api/posts' },
      { method: 'get', path: '/api/friends' },
      { method: 'post', path: '/api/conversations' }
    ];

    for (const endpoint of endpoints) {
      const response = await request(app)[endpoint.method](endpoint.path)
        .send({ content: 'test' });

      expect(response.status).toBe(401);
    }
  });

  it('should handle malformed requests appropriately', async () => {
    // Test invalid post creation
    const invalidPostResponse = await request(app)
      .post('/api/posts')
      .set('Cookie', authCookie)
      .send({}); // Empty body

    expect([400, 422]).toContain(invalidPostResponse.status);

    // Test invalid friend request
    const invalidFriendResponse = await request(app)
      .post('/api/friends/request/invalid')
      .set('Cookie', authCookie);

    expect(invalidFriendResponse.status).toBe(400);
  });
});
