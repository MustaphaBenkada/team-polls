// @ts-nocheck
import express, { Request, Response } from 'express';
import { z } from 'zod';
import pool from '../db';
import { CastVotePayload } from '../types/poll';
import rateLimit from 'express-rate-limit';
import { broadcastTally } from '../websocket';

const router = express.Router();

// Create rate limiter instance
const voteLimiter = rateLimit({
  windowMs: 1000, // 1 second window
  max: 5,
  message: 'Too many votes cast from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (request) => request.ip || 'unknown'
});

// Cast Vote (authentication and rate limiting are handled in index.ts)
router.post('/:id/vote', voteLimiter, async (req: Request<{ id: string }, {}, CastVotePayload>, res: Response) => {
  const { id } = req.params;
  const { optionIndex } = req.body;
  const userId = req.userId;

  if (!userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const pollResult = await pool.query('SELECT options, expires_at FROM polls WHERE id = $1', [id]);
    if (pollResult.rows.length === 0) {
      return res.status(404).json({ error: 'Poll not found' });
    }

    const poll = pollResult.rows[0];
    if (new Date(poll.expires_at) < new Date()) {
      return res.status(400).json({ error: 'Poll has expired' });
    }

    if (optionIndex < 0 || optionIndex >= poll.options.length) {
      return res.status(400).json({ error: 'Invalid option index' });
    }

    // Idempotency: Check if the user has already voted
    const existingVote = await pool.query(
      'SELECT id FROM votes WHERE poll_id = $1 AND user_id = $2',
      [id, userId]
    );

    if (existingVote.rows.length > 0) {
      return res.status(200).json({ message: 'Vote already cast' });
    }

    await pool.query(
      'INSERT INTO votes (poll_id, user_id, option_index) VALUES ($1, $2, $3)',
      [id, userId, optionIndex]
    );

    // Broadcast updated tally via WebSocket
    await broadcastTally(id);

    res.status(201).json({ message: 'Vote cast successfully' });
  } catch (error) {
    console.error('Error casting vote:', error);
    res.status(500).json({ error: 'Failed to cast vote' });
  }
});

export default router;