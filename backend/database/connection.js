const { Pool } = require('pg');
require('dotenv').config();

// Use DATABASE_URL if available (for production), otherwise use individual env vars (for development)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || undefined,
  host: process.env.DATABASE_URL ? undefined : process.env.DB_HOST,
  user: process.env.DATABASE_URL ? undefined : process.env.DB_USER,
  password: process.env.DATABASE_URL ? undefined : process.env.DB_PASSWORD,
  database: process.env.DATABASE_URL ? undefined : process.env.DB_NAME,
  port: process.env.DATABASE_URL ? undefined : process.env.DB_PORT,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// This will be set by server.js after io is created
let io = null;

const setIO = (ioInstance) => {
  io = ioInstance;
};

module.exports = { pool, io, setIO };
