import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

async function checkDb() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'librery',
    port: parseInt(process.env.DB_PORT || '3306', 10),
  });

  console.log("--- MySQL Variables ---");
  const [vars] = await connection.query("SHOW VARIABLES LIKE 'character_set%'");
  console.log(vars);

  const [coll] = await connection.query("SHOW VARIABLES LIKE 'collation%'");
  console.log(coll);

  console.log("\n--- Table Creation ---");
  const tables = ['members', 'books', 'notices'];
  for (const table of tables) {
    try {
      const [createTable]: any = await connection.query(`SHOW CREATE TABLE ${table}`);
      console.log(`\nTable ${table}:`);
      console.log(createTable[0]['Create Table']);
    } catch (err: any) {
      console.error(`Error showing create table for ${table}:`, err.message);
    }
  }

  console.log("\n--- Checking for corrupted rows ---");
  try {
    const [rows]: any = await connection.query("SELECT id, name FROM members WHERE name LIKE '%?%' OR name = '????' LIMIT 5");
    console.log("Potentially corrupted rows:", rows);
  } catch (err: any) {
    console.error("Error querying members:", err.message);
  }

  await connection.end();
}

checkDb().catch(console.error);
