import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const poolConfig = {};

if (process.env.DATABASE_URL) {
  poolConfig['connectionString'] = process.env.DATABASE_URL;
} else {
  poolConfig['user'] = process.env.DB_USER;
  poolConfig['password'] = process.env.DB_PASSWORD;
  poolConfig['database'] = process.env.DB_NAME;
  poolConfig['host'] = process.env.DB_HOST || 'localhost'; // Default host
  poolConfig['port'] = process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432; // Default port
}

const pool = new Pool(poolConfig);

export default pool;