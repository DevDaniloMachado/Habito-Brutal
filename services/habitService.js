import { getDatabase } from "../database/db";

const MAX_HABITS = 3;

export async function getHabits() {
  return getDatabase().getAllAsync(
    "SELECT * FROM habits ORDER BY datetime(created_at) ASC, id ASC"
  );
}

export async function createHabit({ name, icon, color, requiresPhoto }) {
  const db = getDatabase();
  const countRow = await db.getFirstAsync("SELECT COUNT(*) as total FROM habits");

  if (countRow.total >= MAX_HABITS) {
    throw new Error("Limite de 3 habitos atingido.");
  }

  const createdAt = new Date().toISOString();

  await db.runAsync(
    `INSERT INTO habits (name, icon, color, requires_photo, created_at)
     VALUES (?, ?, ?, ?, ?)`,
    [name.trim(), icon, color, requiresPhoto ? 1 : 0, createdAt]
  );
}

export async function updateHabit(id, { name, icon, color, requiresPhoto }) {
  await getDatabase().runAsync(
    "UPDATE habits SET name = ?, icon = ?, color = ?, requires_photo = ? WHERE id = ?",
    [name.trim(), icon, color, requiresPhoto ? 1 : 0, id]
  );
}

export async function deleteHabit(id) {
  await getDatabase().runAsync("DELETE FROM habits WHERE id = ?", [id]);
}

export async function getTodayChecks(dateKey) {
  return getDatabase().getAllAsync(
    "SELECT * FROM habit_checks WHERE date_key = ?",
    [dateKey]
  );
}

export async function completeHabit(habitId, dateKey, proofUri = null) {
  const habit = await getDatabase().getFirstAsync(
    "SELECT * FROM habits WHERE id = ?",
    [habitId]
  );

  if (habit?.requires_photo && !proofUri) {
    throw new Error("Este habito exige prova fotografica.");
  }

  const completedAt = new Date().toISOString();

  await getDatabase().runAsync(
    `INSERT OR IGNORE INTO habit_checks (habit_id, date_key, completed_at)
     VALUES (?, ?, ?)`,
    [habitId, dateKey, completedAt]
  );

  const check = await getDatabase().getFirstAsync(
    "SELECT * FROM habit_checks WHERE habit_id = ? AND date_key = ?",
    [habitId, dateKey]
  );

  if (proofUri && check) {
    await getDatabase().runAsync(
      `INSERT INTO proof_photos (habit_id, check_id, date_key, image_uri, created_at)
       VALUES (?, ?, ?, ?, ?)`,
      [habitId, check.id, dateKey, proofUri, completedAt]
    );
  }
}
