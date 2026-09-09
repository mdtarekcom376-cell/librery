import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Robust multi-path .env resolution for cPanel/LiteSpeed environments
dotenv.config();
dotenv.config({ path: path.join(__dirname, '..', '.env') });
dotenv.config({ path: path.join(__dirname, '.env') });
if (fs.existsSync('/home/okkhorpa/librery/.env')) {
  dotenv.config({ path: '/home/okkhorpa/librery/.env' });
}

const dbHost = process.env.DB_HOST || '127.0.0.1';
const dbUser = process.env.DB_USER || 'okkhorpa_tawha';
const dbPassword = process.env.DB_PASSWORD || '@admin.com';
const dbName = process.env.DB_NAME || 'okkhorpa_okkhorpa_pathagar';
const dbPort = parseInt(process.env.DB_PORT || '3306', 10);

const pool = mysql.createPool({
  host: dbHost === 'localhost' ? '127.0.0.1' : dbHost,
  user: dbUser,
  password: dbPassword,
  database: dbName,
  port: dbPort,
  charset: 'utf8mb4',
  waitForConnections: true,
  connectionLimit: 4,
  queueLimit: 0,
  connectTimeout: 10000,
});

pool.on('connection', (conn) => {
  conn.query("SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci").catch((err: any) => {
    console.error("Failed to set charset on connection:", err?.message || err);
  });
});

export default pool;

