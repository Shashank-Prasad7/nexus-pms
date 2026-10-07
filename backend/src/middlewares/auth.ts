import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/db';

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
}

export interface AuthRequest extends Request {
  user?: AuthenticatedUser;
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'Authorization token required. Please log in.',
      });
      return;
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET || 'super_secret_jwt_key_project_management_2026';

    let decoded: any;
    try {
      decoded = jwt.verify(token, secret);
    } catch (err: any) {
      if (err.name === 'TokenExpiredError') {
        res.status(401).json({
          success: false,
          code: 'TOKEN_EXPIRED',
          message: 'Your session has expired. Please log in again.',
        });
        return;
      }
      res.status(401).json({
        success: false,
        message: 'Invalid authorization token. Please log in again.',
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, name: true, email: true },
    });

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'User no longer exists. Please re-register or log in.',
      });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};
