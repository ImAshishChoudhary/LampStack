import { Router } from 'express';
import prisma from '../prisma/client';
import { googleClient, GOOGLE_CLIENT_ID } from '../utils/googleClient.utils';
import { signJwt, verifyJwt, decodeJwt } from '../utils/jwt.utils.';
import { authenticateJWT } from '../middleware/auth.middleware'

import { Response } from 'express';
import { AuthRequest } from '../types/express';

const router = Router();
const FRONTEND_REDIRECT = process.env.FRONTEND_REDIRECT!;

router.get('/google', (req, res) => {
  const url = googleClient.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: ['profile', 'email'],
  });
  res.redirect(url);
});

router.get('/google/callback', async (req, res) => {
  const code = req.query.code as string;
  if (!code) {
    console.error('[auth] Missing authorization code');
    return res.status(400).send('Missing code');
  }

  try {
    console.log('[auth] Exchanging code for tokens...');
    const { tokens } = await googleClient.getToken(code);
    const idToken = tokens.id_token;
    const refreshToken = tokens.refresh_token;

    if (!idToken) {
      console.error('[auth] Missing ID token in response');
      throw new Error('Missing ID token');
    }

    console.log('[auth] Verifying ID token...');
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      console.error('[auth] Invalid payload from ID token');
      throw new Error('Invalid ID token');
    }

    console.log('[auth] Upserting user:', payload.email);
    const user = await prisma.user.upsert({
      where: { googleId: payload.sub },
      update: {
        email: payload.email,
        name: payload.name || '',
        picture: payload.picture || '',
        refreshToken: refreshToken ?? undefined,
      },
      create: {
        googleId: payload.sub,
        email: payload.email,
        name: payload.name || '',
        picture: payload.picture || '',
        refreshToken: refreshToken ?? '',
      },
    });

    console.log('[auth] Generating JWT for user ID:', user.id);
    const customJwt = signJwt(user);
    const redirectUrl = `${FRONTEND_REDIRECT}?jwt=${customJwt}`;
    console.log('[auth] Redirecting to:', redirectUrl);
    res.redirect(redirectUrl);
  } catch (err) {
    console.error('[auth] Callback error:', err);
    console.error('[auth] Error stack:', err instanceof Error ? err.stack : 'No stack trace');
    res.status(500).send('Authentication failed');
  }
});

router.post('/refresh', async (req, res) => {
  const oldToken = req.body.token;
  if (!oldToken) return res.status(400).json({ error: 'Missing token' });

  let payload: any;
  try {
    payload = verifyJwt(oldToken);
    return res.status(200).json({ token: oldToken }); // still valid
  } catch (err: any) {
    if (err.name !== 'TokenExpiredError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    payload = decodeJwt(oldToken);
    if (!payload || !payload.userId) {
      return res.status(401).json({ error: 'Cannot refresh token' });
    }
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user || !user.refreshToken) {
      return res.status(401).json({ error: 'No refresh token found' });
    }

    googleClient.setCredentials({ refresh_token: user.refreshToken });
    const { credentials } = await googleClient.refreshAccessToken();
    const newIdToken = credentials.id_token;
    if (!newIdToken) throw new Error('No ID token returned from refresh');

    const ticket = await googleClient.verifyIdToken({
      idToken: newIdToken,
      audience: GOOGLE_CLIENT_ID,
    });

    const newPayload = ticket.getPayload();
    if (!newPayload || !newPayload.email) throw new Error('Invalid ID token');

    const newJwt = signJwt(user);
    res.status(200).json({ token: newJwt });
  } catch (err) {
    console.error('[refresh] Error refreshing token:', err);
    res.status(500).json({ error: 'Failed to refresh token' });
  }
});


router.post('/logout', authenticateJWT, async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });

    return res.status(200).json({ message: 'Logged out successfully' });
  } catch (err) {
    console.error('Logout error:', err);
    return res.status(500).json({ message: 'Failed to logout' });
  }
});

router.get('/me', authenticateJWT, async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  return res.status(200).json({
    user: {
      userId: req.user.userId,
      email: req.user.email,
      name: req.user.name,
      picture: req.user.picture,
    }
  });
});

export default router;
