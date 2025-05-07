// @ts-nocheck
import express, { Request, Response } from 'express';
import { z } from 'zod';
import pool from '../db';
import { CreatePollPayload } from '../types/poll';

const router = express.Router();

router.post('/', async (
  req: Request<{}, {}, CreatePollPayload>,
  res: Response
) => {
  try {
    const parsedPayload = z.object({
      question: z.string(),
      options: z.string().array().min(2),
      expiresAt: z.string().datetime(),
    }).safeParse(req.body);

    if (!parsedPayload.success) {
      return res.status(400).json({ errors: parsedPayload.error.issues });
    }

    const { question, options, expiresAt } = parsedPayload.data;
    const result = await pool.query(
      'INSERT INTO polls (question, options, expires_at) VALUES ($1, $2, $3) RETURNING id',
      [question, options, expiresAt]
    );
    res.status(201).json({ id: result.rows[0].id });
  } catch (error) {
    console.error('Error creating poll:', error);
    res.status(500).json({ error: 'Failed to create poll' });
  }
});

router.get('/:id', async (
  req: Request<{ id: string }, {}, {}>, // Added empty object for request body
  res: Response
) => {
  const { id } = req.params;
  try {
    const pollResult = await pool.query('SELECT id, question, options, expires_at FROM polls WHERE id = $1', [id]);
    if (pollResult.rows.length === 0) {
      return res.status(404).json({ error: 'Poll not found' });
    }
    const poll = pollResult.rows[0];

    const tallyResult = await pool.query(
      'SELECT option_index, COUNT(*) FROM votes WHERE poll_id = $1 GROUP BY option_index ORDER BY option_index',
      [id]
    );

    const tally = poll.options.map((_, index: number) => {
      const vote = tallyResult.rows.find((row) => row.option_index === index);
      return parseInt(vote?.count || '0');
    });

    res.json({ ...poll, tally });
  } catch (error) {
    console.error('Error fetching poll:', error);
    res.status(500).json({ error: 'Failed to fetch poll data' });
  }
});

export default router;