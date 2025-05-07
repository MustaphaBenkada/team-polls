import express, { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import helmet from 'helmet';
import pool from './db';
import { CreatePollPayload, CastVotePayload, PollSchema } from './types/poll';
import { z } from 'zod';
import { setupWebSocket } from './websocket';
import pollRoutes from './routes/pollRoutes';
import voteRoutes from './routes/voteRoutes';
import authRoutes from './routes/authRoutes';
import rateLimit from 'express-rate-limit';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(helmet());
app.use(express.json());

const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-for-dev'; // Ensure strong secret in production

const voteLimiter = rateLimit({
  windowMs: 1000, // 1 second window
  max: 5,
  message: 'Too many votes cast from this user, please try again later.',
  keyGenerator: (req) => req.body.userId, // Assuming userId is in the vote body
});

// Use the separated routes
app.use('/poll', pollRoutes);
app.use('/poll', voteLimiter, voteRoutes); // Apply rate limiting to vote routes
app.use('/auth', authRoutes);

const server = app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

setupWebSocket(server);