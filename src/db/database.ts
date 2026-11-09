import { open, Database } from "sqlite";
import sqlite3 from "sqlite3";
import path from "path";

const DB_FILE = path.join(process.cwd(), "db", "blog.db");

let db: Database | null = null;

export async function connectDB(): Promise<Database> {
  console.log(`Connecting to database at ${DB_FILE}`);
  db = await open({
    filename: DB_FILE,
    driver: sqlite3.Database,
  });

  await db.run(`
    CREATE TABLE IF NOT EXISTS blog_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      teaser TEXT NOT NULL,
      author TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      image TEXT NOT NULL,
      content TEXT NOT NULL
    )
  `);

  return db;
}

export function getDB(): Database {
  if (!db) {
    throw new Error("Database not connected. Please call connectDB() first.");
  }
  return db;
}

export async function closeDB(): Promise<void> {
  if (db) {
    await db.close();
    db = null;
  }
}
