import { prismaMock } from './prismaMock';
import request from 'supertest';
import app from '../src/app';
import jwt from 'jsonwebtoken';

process.env.JWT_SECRET = 'test-secret';

const adminToken = jwt.sign(
  { userId: 1, username: 'admin', isAdmin: true },
  process.env.JWT_SECRET || 'secret'
);

const userToken = jwt.sign(
  { userId: 2, username: 'user', isAdmin: false },
  process.env.JWT_SECRET || 'secret'
);

describe('Sweets API', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/sweets', () => {
    it('should create a sweet if admin', async () => {
      const sweet = {
        id: 1,
        name: 'Choco',
        category: 'Chocolate',
        price: 10,
        quantity: 100,
        imageUrl: null
      };

      prismaMock.sweet.create.mockResolvedValue(sweet);

      const res = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Choco',
          category: 'Chocolate',
          price: 10,
          quantity: 100
        });

      expect(res.status).toBe(201);
      expect(res.body).toEqual(sweet);
      expect(prismaMock.sweet.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({
            name: 'Choco',
            category: 'Chocolate',
            price: 10,
            quantity: 100
        })
      }));
    });

    it('should forbid non-admin', async () => {
      const res = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${userToken}`)
        .send({});

      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/sweets', () => {
    it('should return all sweets', async () => {
      const sweets = [
        { id: 1, name: 'A', category: 'C', price: 1, quantity: 1, imageUrl: null },
        { id: 2, name: 'B', category: 'C', price: 2, quantity: 2, imageUrl: null }
      ];
      prismaMock.sweet.findMany.mockResolvedValue(sweets);

      const res = await request(app)
        .get('/api/sweets')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual(sweets.map(s => ({ ...s, lowStock: true })));
    });
  });

  describe('GET /api/sweets/search', () => {
    it('should filter by name', async () => {
      const sweets = [{ id: 1, name: 'Choco', category: 'C', price: 1, quantity: 1, imageUrl: null }];
      prismaMock.sweet.findMany.mockResolvedValue(sweets);

      const res = await request(app)
        .get('/api/sweets/search?name=Choco')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual(sweets.map(s => ({ ...s, lowStock: true })));
      // Check if prisma was called with correct filter
      // Note: Implementation details might vary (contains vs equals), but TDD defines expectation.
      // I expect it to use 'contains' for name.
      expect(prismaMock.sweet.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({
            name: { contains: 'Choco' }
        })
      }));
    });

    it('should filter by price range', async () => {
      prismaMock.sweet.findMany.mockResolvedValue([]);
      
      await request(app)
        .get('/api/sweets/search?minPrice=5&maxPrice=10')
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(prismaMock.sweet.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({
            price: { gte: 5, lte: 10 }
        })
      }));
    });
  });

  describe('PUT /api/sweets/:id', () => {
    it('should update sweet if admin', async () => {
      const updatedSweet = { id: 1, name: 'New', category: 'C', price: 1, quantity: 1, imageUrl: null };
      prismaMock.sweet.update.mockResolvedValue(updatedSweet);

      const res = await request(app)
        .put('/api/sweets/1')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'New' });

      expect(res.status).toBe(200);
      expect(res.body).toEqual(updatedSweet);
    });
  });

  describe('DELETE /api/sweets/:id', () => {
    it('should delete sweet if admin', async () => {
      const deletedSweet = { id: 1, name: 'Del', category: 'C', price: 1, quantity: 1, imageUrl: null };
      prismaMock.sweet.delete.mockResolvedValue(deletedSweet);

      const res = await request(app)
        .delete('/api/sweets/1')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(204);
    });
  });
});
