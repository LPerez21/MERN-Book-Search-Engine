// server/src/services/auth.ts
import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface JwtPayload {
  _id: string;
  username: string;
  email: string;
}

const SECRET = process.env.JWT_SECRET_KEY || 'mysecret';
const EXPIRATION = '1h';

// Apollo context
export function authMiddleware({ req }: { req: Request }) {
  const token = req.headers.authorization?.split(' ')[1] || '';
  try {
    const { data } = jwt.verify(token, SECRET) as any;
    return { user: data as JwtPayload };
  } catch {
    return { user: null };
  }
}

// Express REST middleware
export function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.sendStatus(401);
    return;
  }
  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, SECRET) as JwtPayload;
    (req as any).user = payload;
    next();
    return;
  } catch {
    res.sendStatus(403);
    return;
  }
}

export function signToken(user: JwtPayload): string {
  return jwt.sign({ data: user }, SECRET, { expiresIn: EXPIRATION });
}
