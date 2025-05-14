import express, { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';

const router = express.Router();
const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-for-dev';

const anonymousAuthLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 100,
  message: 'Too many anonymous token requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (request) => {
    const forwardedFor = request.headers['x-forwarded-for'];
    const realIp = request.headers['x-real-ip'];
    const remoteAddress = request.socket.remoteAddress;
    
    // Try to get the real client IP from various headers and fallbacks
    const clientIp = (
      (typeof forwardedFor === 'string' && forwardedFor.split(',')[0]) ||
      (typeof realIp === 'string' && realIp) ||
      remoteAddress ||
      'unknown'
    ).trim();
    
    console.log('Rate limit key generated for IP:', clientIp);
    return clientIp;
  }
});

router.post('/anon', anonymousAuthLimiter, (req: Request, res: Response) => {
  try {
    const userId = uuidv4();
    const token = jwt.sign({ userId }, jwtSecret, { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    console.error('Error generating anonymous token:', error);
    res.status(500).json({ error: 'Failed to generate anonymous token' });
  }
});

export default router;