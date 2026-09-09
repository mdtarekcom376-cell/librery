import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const dbHost = process.env.DB_HOST || '127.0.0.1';
const dbUser = process.env.DB_USER || 'root';
const dbPassword = process.env.DB_PASSWORD || '';
const dbName = process.env.DB_NAME || 'librery';
const dbPort = parseInt(process.env.DB_PORT || '3306', 10);

if (!process.env.DB_USER) {
  console.warn("⚠️ Warning: DB_USER is not defined in environment variables! Using fallback 'root'. On cPanel, ensure DB_USER is configured in the Node.js selector.");
}

const pool = mysql.createPool({
  host: dbHost === 'localhost' ? '127.0.0.1' : dbHost,
  user: dbUser,
  password: dbPassword,
  database: dbName,
  port: dbPort,
  charset: 'utf8mb4',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 10000,
});

pool.on('connection', (conn) => {
  conn.query("SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci").catch((err: any) => {
    console.error("Failed to set charset on connection:", err?.message || err);
  });
});

export default pool;

