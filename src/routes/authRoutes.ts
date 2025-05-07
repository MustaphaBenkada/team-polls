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
});

router.post('/anon', anonymousAuthLimiter, (req: Request, res: Response) => {
  const userId = uuidv4();
  const token = jwt.sign({ userId }, jwtSecret, { expiresIn: '1h' });
  res.json({ token });
});

export default router;