import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

export function verifyToken(req: NextRequest): { id: string } | null {
  const authHeader = req.headers.get('authorization');
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return null;

  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
  } catch {
    return null;
  }
}