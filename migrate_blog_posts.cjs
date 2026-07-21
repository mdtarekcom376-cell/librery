const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

async function migrate() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'librery',
    port: parseInt(process.env.DB_PORT || '3306', 10),
  });

  const sql = `
  CREATE TABLE IF NOT EXISTS blog_posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    image LONGTEXT DEFAULT NULL,
    category VARCHAR(50) NOT NULL,
    event_date DATETIME DEFAULT NULL,
    created_at DATETIME NOT NULL
  ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  `;

  try {
    await connection.query(sql);
    console.log("Successfully created blog_posts table.");
  } catch (err) {
    console.error("Error creating table:", err.message);
  }

  await connection.end();
}

migrate().catch(console.error);
