import express, { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import helmet from 'helmet';
import cors from 'cors';
import pool, { testConnection } from './db';
import { CreatePollPayload, CastVotePayload, PollSchema } from './types/poll';
import { z } from 'zod';
import { setupWebSocket } from './websocket';
import pollRoutes from './routes/pollRoutes';
import voteRoutes from './routes/voteRoutes';
import authRoutes from './routes/authRoutes';
import { authenticate } from './middleware/authMiddleware';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://frontend:5173',
  'http://app:3000',
  'http://localhost:3000',
  'http://host.docker.internal:5173',
  'http://host.docker.internal:3000'
];

app.use(cors({
  origin: (origin, callback) => {
    // In development, accept all origins
    if (!origin || process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    if (allowedOrigins.indexOf(origin) === -1) {
      console.log('Origin not allowed:', origin);
      return callback(null, false);
    }
    console.log('Origin allowed:', origin);
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
}));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - Origin: ${req.headers.origin}`);
  next();
});

app.use(express.json());

const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-for-dev';

// Extract userId from JWT token
const getUserIdFromToken = (req: Request): string | null => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, jwtSecret) as { userId: string };
      return decoded.userId;
    } catch (error) {
      return null;
    }
  }
  return null;
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Routes that don't need authentication
app.use('/api/auth', authRoutes);

// Protected routes with authentication
app.use('/api/poll', authenticate as express.RequestHandler);
app.use('/api/poll', pollRoutes);
app.use('/api/poll', voteRoutes);

const startServer = async () => {
  try {
    // Test database connection with retries
    await testConnection();

    const server = app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });

    // Setup WebSocket immediately after server starts
    setupWebSocket(server);
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();