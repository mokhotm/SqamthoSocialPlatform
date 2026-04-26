// tests/server/subscriptions.test.ts
import request from 'supertest';
import express from 'express';
import { setupAuth } from '../../server/auth';

const app = express();
app.use(express.json());
setupAuth(app);

// Mock subscription routes (would need to be implemented in routes.ts)
app.get('/api/subscriptions', async (req, res) => {
  // Mock implementation
  res.json([
    {
      id: 1,
      userId: 1,
      name: 'Netflix',
      amount: 15.99,
      currency: 'USD',
      billingCycle: 'monthly',
      nextBillingDate: '2024-02-15',
      category: 'Entertainment',
      status: 'active',
      autoRenew: true
    }
  ]);
});

app.post('/api/subscriptions', async (req, res) => {
  // Mock implementation
  res.status(201).json({ id: 2, ...req.body });
});

app.get('/api/subscriptions/active', async (req, res) => {
  // Mock implementation
  res.json([
    {
      id: 1,
      name: 'Netflix',
      nextBillingDate: '2024-02-15',
      amount: 15.99
    }
  ]);
});

app.get('/api/subscriptions/upcoming/:days', async (req, res) => {
  // Mock implementation
  res.json([
    {
      id: 1,
      name: 'Netflix',
      nextBillingDate: '2024-02-15'
    }
  ]);
});

app.put('/api/subscriptions/:id', async (req, res) => {
  // Mock implementation
  res.json({ id: parseInt(req.params.id), ...req.body });
});

app.delete('/api/subscriptions/:id', async (req, res) => {
  // Mock implementation
  res.status(204).send();
});

describe('Subscriptions API', () => {
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

  describe('GET /api/subscriptions', () => {
    it('should return user subscriptions', async () => {
      const response = await request(app)
        .get('/api/subscriptions')
        .set('Cookie', authCookie);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      if (response.body.length > 0) {
        expect(response.body[0]).toHaveProperty('name');
        expect(response.body[0]).toHaveProperty('amount');
        expect(response.body[0]).toHaveProperty('billingCycle');
      }
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .get('/api/subscriptions');

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/subscriptions', () => {
    it('should create a new subscription', async () => {
      const newSubscription = {
        name: 'Spotify Premium',
        amount: 9.99,
        currency: 'USD',
        billingCycle: 'monthly',
        nextBillingDate: '2024-02-01',
        category: 'Entertainment',
        provider: 'Spotify',
        status: 'active',
        autoRenew: true
      };

      const response = await request(app)
        .post('/api/subscriptions')
        .set('Cookie', authCookie)
        .send(newSubscription);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(newSubscription.name);
      expect(response.body.amount).toBe(newSubscription.amount);
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .post('/api/subscriptions')
        .send({
          name: 'Test Subscription',
          amount: 10.00,
          billingCycle: 'monthly'
        });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/subscriptions/active', () => {
    it('should return active subscriptions', async () => {
      const response = await request(app)
        .get('/api/subscriptions/active')
        .set('Cookie', authCookie);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('GET /api/subscriptions/upcoming/:days', () => {
    it('should return upcoming renewals', async () => {
      const response = await request(app)
        .get('/api/subscriptions/upcoming/7')
        .set('Cookie', authCookie);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('PUT /api/subscriptions/:id', () => {
    it('should update a subscription', async () => {
      const updates = {
        amount: 16.99,
        nextBillingDate: '2024-03-15'
      };

      const response = await request(app)
        .put('/api/subscriptions/1')
        .set('Cookie', authCookie)
        .send(updates);

      expect(response.status).toBe(200);
      expect(response.body.amount).toBe(updates.amount);
      expect(response.body.nextBillingDate).toBe(updates.nextBillingDate);
    });
  });

  describe('DELETE /api/subscriptions/:id', () => {
    it('should cancel a subscription', async () => {
      const response = await request(app)
        .delete('/api/subscriptions/1')
        .set('Cookie', authCookie);

      expect(response.status).toBe(204);
    });
  });
});
