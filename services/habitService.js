import { getDatabase } from "../database/db";

const MAX_HABITS = 3;

export async function getHabits() {
  return getDatabase().getAllAsync(
    "SELECT * FROM habits ORDER BY datetime(created_at) ASC, id ASC"
  );
}

export async function createHabit({ name, icon, color }) {
  const db = getDatabase();
  const countRow = await db.getFirstAsync("SELECT COUNT(*) as total FROM habits");

  if (countRow.total >= MAX_HABITS) {
    throw new Error("Limite de 3 habitos atingido.");
  }

  const createdAt = new Date().toISOString();

  await db.runAsync(
    "INSERT INTO habits (name, icon, color, created_at) VALUES (?, ?, ?, ?)",
    [name.trim(), icon, color, createdAt]
  );
}

export async function updateHabit(id, { name, icon, color }) {
  await getDatabase().runAsync(
    "UPDATE habits SET name = ?, icon = ?, color = ? WHERE id = ?",
    [name.trim(), icon, color, id]
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

export async function completeHabit(habitId, dateKey) {
  const completedAt = new Date().toISOString();

  await getDatabase().runAsync(
    `INSERT OR IGNORE INTO habit_checks (habit_id, date_key, completed_at)
     VALUES (?, ?, ?)`,
    [habitId, dateKey, completedAt]
  );
}
