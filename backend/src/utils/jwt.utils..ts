import jwt from 'jsonwebtoken';
import { User } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET!;

export function signJwt(user: User) {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      name: user.name,
      picture: user.picture,
    },
    JWT_SECRET,
    { expiresIn: '12h' }
  );
}

export function verifyJwt(token: string) {
  return jwt.verify(token, JWT_SECRET);
}

export function decodeJwt(token: string) {
  return jwt.decode(token);
}
