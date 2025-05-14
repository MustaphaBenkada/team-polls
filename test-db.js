const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'teampolls',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10)
});

async function testConnection() {
  try {
    const client = await pool.connect();
    console.log('Successfully connected to the database!');
    
    const result = await client.query('SELECT NOW()');
    console.log('Database time:', result.rows[0].now);
    
    client.release();
    await pool.end();
  } catch (err) {
    console.error('Database connection error:', err.message);
  }
}

testConnection(); 