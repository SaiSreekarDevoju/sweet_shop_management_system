import { prismaMock } from './prismaMock';
import request from 'supertest';
import app from '../src/app';
import jwt from 'jsonwebtoken';

process.env.JWT_SECRET = 'test-secret';

describe('Inventory APIs', () => {
  const adminToken = jwt.sign({ id: 1, isAdmin: true }, process.env.JWT_SECRET || 'secret');
  const userToken = jwt.sign({ id: 2, isAdmin: false }, process.env.JWT_SECRET || 'secret');
  const sweetId = 1; // Changed to number

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/sweets/:id/purchase', () => {
    it('should decrease quantity by 1', async () => {
      const sweet = { id: sweetId, name: 'Choco', category: 'Chocolate', price: 10, quantity: 5, imageUrl: null };
      const updatedSweet = { ...sweet, quantity: 4 };

      // Mock transaction to execute callback
      // @ts-ignore
      prismaMock.$transaction.mockImplementation((callback) => callback(prismaMock));
      
      prismaMock.sweet.findUnique.mockResolvedValue(sweet);
      prismaMock.sweet.update.mockResolvedValue(updatedSweet);
      prismaMock.purchase.create.mockResolvedValue({ id: 1, userId: 2, sweetId, quantity: 1, totalPrice: 10, purchaseDate: new Date() });

      const res = await request(app)
        .post(`/api/sweets/${sweetId}/purchase`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ quantity: 1 });

      expect(res.status).toBe(200);
      // The route returns { sweet: updatedSweet, count: purchaseQty }
      expect(res.body.sweet.quantity).toBe(4);
      expect(res.body.count).toBe(1);
      
      expect(prismaMock.sweet.update).toHaveBeenCalledWith({
        where: { id: sweetId },
        data: { quantity: 4 }, // 5 - 1
      });
    });

    it('should return 400 if out of stock', async () => {
      // @ts-ignore
      prismaMock.$transaction.mockImplementation((callback) => callback(prismaMock));
      
      prismaMock.sweet.findUnique.mockResolvedValue({ id: sweetId, name: 'Choco', category: 'Chocolate', price: 10, quantity: 0, imageUrl: null });

      const res = await request(app)
        .post(`/api/sweets/${sweetId}/purchase`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ quantity: 1 });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Insufficient stock'); // Updated error message
    });

    it('should return 400 if sweet not found (caught inside transaction)', async () => {
        // @ts-ignore
        prismaMock.$transaction.mockImplementation((callback) => callback(prismaMock));
        prismaMock.sweet.findUnique.mockResolvedValue(null);
  
        const res = await request(app)
          .post(`/api/sweets/${sweetId}/purchase`)
          .set('Authorization', `Bearer ${userToken}`)
          .send({}); // Send empty body to ensure req.body exists
  
        expect(res.status).toBe(400); // The catch block handles the error thrown in transaction
        expect(res.body.error).toBe('Sweet not found');
      });
  });

  describe('POST /api/sweets/:id/restock', () => {
    it('should increase quantity if admin', async () => {
      const sweet = { id: sweetId, name: 'Choco', category: 'Chocolate', price: 10, quantity: 5, imageUrl: null };
      const updatedSweet = { ...sweet, quantity: 15 };

      prismaMock.sweet.findUnique.mockResolvedValue(sweet);
      prismaMock.sweet.update.mockResolvedValue(updatedSweet);

      const res = await request(app)
        .post(`/api/sweets/${sweetId}/restock`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ quantity: 10 });

      expect(res.status).toBe(200);
      expect(res.body.quantity).toBe(15);
      expect(prismaMock.sweet.update).toHaveBeenCalledWith({
        where: { id: sweetId },
        data: { quantity: 15 }, // 5 + 10
      });
    });

    it('should forbid non-admin', async () => {
      const res = await request(app)
        .post(`/api/sweets/${sweetId}/restock`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ quantity: 10 });

      expect(res.status).toBe(403);
    });

    it('should validate quantity', async () => {
      const res = await request(app)
        .post(`/api/sweets/${sweetId}/restock`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ quantity: -5 });

      expect(res.status).toBe(400);
    });

    it('should return 404 if sweet not found during restock', async () => {
      prismaMock.sweet.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .post(`/api/sweets/${sweetId}/restock`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ quantity: 10 });

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Sweet not found');
    });
  });
});
