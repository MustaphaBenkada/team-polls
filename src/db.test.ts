import { Pool } from 'pg';
import pool from './db';

describe('Database Connection', () => {
  it('should connect to the database', async () => {
    try {
      const client = await pool.connect();
      const result = await client.query('SELECT NOW()');
      expect(result.rows.length).toBe(1);
      client.release();
    } catch (err) {
      throw err;
    }
  });

  afterAll(async () => {
    await pool.end();
  });
}); 