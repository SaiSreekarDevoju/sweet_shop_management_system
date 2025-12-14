import { prismaMock } from './prismaMock';
import request from 'supertest';
import app from '../src/app';
import bcrypt from 'bcrypt';

process.env.JWT_SECRET = 'test-secret';

describe('Auth Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);
      prismaMock.user.create.mockResolvedValue({
        id: 1,
        username: 'testuser',
        password: 'hashedpassword',
        isAdmin: false
      });

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          password: 'password123',
        });
      
      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('message', 'User created successfully');
      expect(res.body).toHaveProperty('userId');
    });

    it('should return 400 if username already exists', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: 1,
        username: 'duplicateuser',
        password: 'hashedpassword',
        isAdmin: false
      });

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'duplicateuser',
          password: 'password123',
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('error', 'Username already exists');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login successfully and return a token', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      prismaMock.user.findUnique.mockResolvedValue({
        id: 1,
        username: 'loginuser',
        password: hashedPassword,
        isAdmin: false
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'loginuser',
          password: 'password123',
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('token');
    });

    it('should fail with invalid credentials', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'nonexistent',
          password: 'wrongpassword',
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('error', 'Invalid credentials');
    });
  });
});
