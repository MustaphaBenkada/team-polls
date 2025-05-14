import { Pool, PoolConfig } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const isDocker = process.env.DOCKER_ENVIRONMENT === 'true';

const poolConfig: PoolConfig = {
  connectionString: process.env.DATABASE_URL,
  // If DATABASE_URL is not provided, use individual connection parameters
  ...(!process.env.DATABASE_URL && {
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'teampolls',
    host: isDocker ? 'db' : (process.env.DB_HOST || 'localhost'),
    port: parseInt(process.env.DB_PORT || '5432', 10),
  }),
  // Add some reasonable pool defaults for Docker environment
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: isDocker ? 10000 : 5000, // Increased timeout for Docker environment
};

const pool = new Pool(poolConfig);

// Add error handler to prevent app crash on connection issues
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

// Function to test the connection with retries
const testConnection = async (retries = 10, delay = 2000) => {
  for (let i = 0; i < retries; i++) {
    try {
      const client = await pool.connect();
      const result = await client.query('SELECT NOW()');
      console.log('Successfully connected to the database at:', result.rows[0].now);
      client.release();
      return true;
    } catch (err: any) {
      console.error(`Failed to connect to database (attempt ${i + 1}/${retries}):`, err.message);
      if (i < retries - 1) {
        console.log(`Waiting ${delay}ms before next attempt...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  throw new Error('Failed to connect to the database after multiple attempts');
};

export { testConnection };
export default pool;