// tests/server/health-records.test.ts
import request from 'supertest';
import express from 'express';
import { setupAuth } from '../../server/auth';

const app = express();
app.use(express.json());
setupAuth(app);

// Mock health records routes (would need to be implemented in routes.ts)
app.get('/api/health-records', async (req, res) => {
  // Mock implementation
  res.json([
    {
      id: 1,
      userId: 1,
      type: 'weight',
      title: 'Morning Weight',
      date: '2024-01-15',
      value: 70.5,
      unit: 'kg',
      description: 'Recorded after waking up'
    }
  ]);
});

app.post('/api/health-records', async (req, res) => {
  // Mock implementation
  res.status(201).json({ id: 2, ...req.body });
});

app.get('/api/health-records/type/:type', async (req, res) => {
  // Mock implementation
  res.json([
    {
      id: 1,
      userId: 1,
      type: req.params.type,
      title: 'Blood Pressure',
      date: '2024-01-15',
      value: 120,
      unit: 'mmHg'
    }
  ]);
});

app.put('/api/health-records/:id', async (req, res) => {
  // Mock implementation
  res.json({ id: parseInt(req.params.id), ...req.body });
});

app.delete('/api/health-records/:id', async (req, res) => {
  // Mock implementation
  res.status(204).send();
});

describe('Health Records API', () => {
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

  describe('GET /api/health-records', () => {
    it('should return user health records', async () => {
      const response = await request(app)
        .get('/api/health-records')
        .set('Cookie', authCookie);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      if (response.body.length > 0) {
        expect(response.body[0]).toHaveProperty('type');
        expect(response.body[0]).toHaveProperty('value');
        expect(response.body[0]).toHaveProperty('unit');
      }
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .get('/api/health-records');

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/health-records', () => {
    it('should create a new health record', async () => {
      const newRecord = {
        type: 'blood_pressure',
        title: 'Blood Pressure Reading',
        date: '2024-01-16',
        value: 118,
        unit: 'mmHg',
        description: 'Systolic reading'
      };

      const response = await request(app)
        .post('/api/health-records')
        .set('Cookie', authCookie)
        .send(newRecord);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.type).toBe(newRecord.type);
      expect(response.body.value).toBe(newRecord.value);
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .post('/api/health-records')
        .send({
          type: 'weight',
          title: 'Weight Record',
          value: 70.0,
          unit: 'kg'
        });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/health-records/type/:type', () => {
    it('should return health records by type', async () => {
      const response = await request(app)
        .get('/api/health-records/type/weight')
        .set('Cookie', authCookie);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('PUT /api/health-records/:id', () => {
    it('should update a health record', async () => {
      const updates = {
        value: 71.0,
        description: 'Updated weight after workout'
      };

      const response = await request(app)
        .put('/api/health-records/1')
        .set('Cookie', authCookie)
        .send(updates);

      expect(response.status).toBe(200);
      expect(response.body.value).toBe(updates.value);
      expect(response.body.description).toBe(updates.description);
    });
  });

  describe('DELETE /api/health-records/:id', () => {
    it('should delete a health record', async () => {
      const response = await request(app)
        .delete('/api/health-records/1')
        .set('Cookie', authCookie);

      expect(response.status).toBe(204);
    });
  });
});
