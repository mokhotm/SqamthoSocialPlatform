// tests/server/financial-records.test.ts
import request from 'supertest';
import express from 'express';
import { setupAuth } from '../../server/auth';

const app = express();
app.use(express.json());
setupAuth(app);

// Mock financial records routes (would need to be implemented in routes.ts)
app.get('/api/financial-records', async (req, res) => {
  // Mock implementation
  res.json([
    {
      id: 1,
      userId: 1,
      title: 'Grocery Shopping',
      category: 'Food',
      amount: 50.00,
      date: '2024-01-15',
      description: 'Weekly groceries'
    }
  ]);
});

app.post('/api/financial-records', async (req, res) => {
  // Mock implementation
  res.status(201).json({ id: 2, ...req.body });
});

app.get('/api/financial-records/category/:category', async (req, res) => {
  // Mock implementation
  res.json([
    {
      id: 1,
      userId: 1,
      title: 'Grocery Shopping',
      category: req.params.category,
      amount: 50.00,
      date: '2024-01-15'
    }
  ]);
});

app.put('/api/financial-records/:id', async (req, res) => {
  // Mock implementation
  res.json({ id: parseInt(req.params.id), ...req.body });
});

app.delete('/api/financial-records/:id', async (req, res) => {
  // Mock implementation
  res.status(204).send();
});

describe('Financial Records API', () => {
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

  describe('GET /api/financial-records', () => {
    it('should return user financial records', async () => {
      const response = await request(app)
        .get('/api/financial-records')
        .set('Cookie', authCookie);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      if (response.body.length > 0) {
        expect(response.body[0]).toHaveProperty('title');
        expect(response.body[0]).toHaveProperty('amount');
        expect(response.body[0]).toHaveProperty('category');
      }
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .get('/api/financial-records');

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/financial-records', () => {
    it('should create a new financial record', async () => {
      const newRecord = {
        title: 'Coffee Purchase',
        category: 'Food & Dining',
        amount: 5.50,
        date: '2024-01-16',
        description: 'Morning coffee'
      };

      const response = await request(app)
        .post('/api/financial-records')
        .set('Cookie', authCookie)
        .send(newRecord);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe(newRecord.title);
      expect(response.body.amount).toBe(newRecord.amount);
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .post('/api/financial-records')
        .send({
          title: 'Test Record',
          category: 'Misc',
          amount: 10.00
        });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/financial-records/category/:category', () => {
    it('should return financial records by category', async () => {
      const response = await request(app)
        .get('/api/financial-records/category/Food')
        .set('Cookie', authCookie);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('PUT /api/financial-records/:id', () => {
    it('should update a financial record', async () => {
      const updates = {
        title: 'Updated Grocery Shopping',
        amount: 55.00
      };

      const response = await request(app)
        .put('/api/financial-records/1')
        .set('Cookie', authCookie)
        .send(updates);

      expect(response.status).toBe(200);
      expect(response.body.title).toBe(updates.title);
      expect(response.body.amount).toBe(updates.amount);
    });
  });

  describe('DELETE /api/financial-records/:id', () => {
    it('should delete a financial record', async () => {
      const response = await request(app)
        .delete('/api/financial-records/1')
        .set('Cookie', authCookie);

      expect(response.status).toBe(204);
    });
  });
});
