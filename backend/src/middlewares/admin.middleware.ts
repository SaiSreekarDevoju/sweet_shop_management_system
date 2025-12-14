import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';

export const adminMiddleware = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!req.user || !req.user.isAdmin) {
    res.status(403).json({ error: 'Access denied. Admins only.' });
    return;
  }
  next();
};
