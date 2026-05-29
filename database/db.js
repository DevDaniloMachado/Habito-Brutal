import * as SQLite from "expo-sqlite";

const db = SQLite.openDatabaseSync("habito_brutal.db");

export async function initDatabase() {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS habits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      icon TEXT NOT NULL,
      color TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS habit_checks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      habit_id INTEGER NOT NULL,
      date_key TEXT NOT NULL,
      completed_at TEXT NOT NULL,
      FOREIGN KEY (habit_id) REFERENCES habits (id) ON DELETE CASCADE,
      UNIQUE (habit_id, date_key)
    );

    CREATE TABLE IF NOT EXISTS streak_state (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      current_streak INTEGER NOT NULL DEFAULT 0,
      best_streak INTEGER NOT NULL DEFAULT 0,
      last_completed_date TEXT
    );

    INSERT OR IGNORE INTO streak_state (id, current_streak, best_streak, last_completed_date)
    VALUES (1, 0, 0, NULL);
  `);
}

export function getDatabase() {
  return db;
}
