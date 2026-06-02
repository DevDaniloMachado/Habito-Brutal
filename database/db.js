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
      requires_photo INTEGER NOT NULL DEFAULT 0,
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

    CREATE TABLE IF NOT EXISTS proof_photos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      habit_id INTEGER NOT NULL,
      check_id INTEGER,
      date_key TEXT NOT NULL,
      image_uri TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (habit_id) REFERENCES habits (id) ON DELETE CASCADE,
      FOREIGN KEY (check_id) REFERENCES habit_checks (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS penalties (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      habit_id INTEGER NOT NULL,
      date_key TEXT NOT NULL,
      amount_cents INTEGER NOT NULL,
      reason TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (habit_id) REFERENCES habits (id) ON DELETE CASCADE,
      UNIQUE (habit_id, date_key)
    );

    CREATE TABLE IF NOT EXISTS notification_settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      daily_reminder_enabled INTEGER NOT NULL DEFAULT 0,
      daily_reminder_identifier TEXT,
      reminder_hour INTEGER NOT NULL DEFAULT 21,
      reminder_minute INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT
    );

    CREATE TABLE IF NOT EXISTS streak_state (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      current_streak INTEGER NOT NULL DEFAULT 0,
      best_streak INTEGER NOT NULL DEFAULT 0,
      last_completed_date TEXT
    );

    INSERT OR IGNORE INTO streak_state (id, current_streak, best_streak, last_completed_date)
    VALUES (1, 0, 0, NULL);

    INSERT OR IGNORE INTO notification_settings (
      id,
      daily_reminder_enabled,
      daily_reminder_identifier,
      reminder_hour,
      reminder_minute,
      updated_at
    )
    VALUES (1, 0, NULL, 21, 0, NULL);
  `);

  await ensureColumn("habits", "requires_photo", "INTEGER NOT NULL DEFAULT 0");
}

export function getDatabase() {
  return db;
}

async function ensureColumn(tableName, columnName, definition) {
  const columns = await db.getAllAsync(`PRAGMA table_info(${tableName})`);
  const exists = columns.some((column) => column.name === columnName);

  if (!exists) {
    await db.execAsync(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition}`);
  }
}
