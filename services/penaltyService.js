import { getDatabase } from "../database/db";
import { addDays, getLocalDateKey } from "../utils/date";

export const PENALTY_AMOUNT_CENTS = 500;

export async function registerMissedHabitPenalties(todayKey = getLocalDateKey()) {
  const db = getDatabase();
  const yesterdayKey = addDays(todayKey, -1);
  const habits = await db.getAllAsync(
    "SELECT * FROM habits WHERE date(created_at) <= date(?)",
    [yesterdayKey]
  );
  const createdAt = new Date().toISOString();
  let inserted = 0;

  for (const habit of habits) {
    const check = await db.getFirstAsync(
      "SELECT id FROM habit_checks WHERE habit_id = ? AND date_key = ?",
      [habit.id, yesterdayKey]
    );

    if (!check) {
      const result = await db.runAsync(
        `INSERT OR IGNORE INTO penalties (habit_id, date_key, amount_cents, reason, created_at)
         VALUES (?, ?, ?, ?, ?)`,
        [habit.id, yesterdayKey, PENALTY_AMOUNT_CENTS, "Falha diaria", createdAt]
      );
      inserted += result.changes ?? 0;
    }
  }

  return inserted;
}

export async function getPenaltySummary() {
  const db = getDatabase();
  const [rows, summary] = await Promise.all([
    db.getAllAsync(
      `SELECT penalties.*, habits.name as habit_name, habits.icon as habit_icon, habits.color as habit_color
       FROM penalties
       LEFT JOIN habits ON habits.id = penalties.habit_id
       ORDER BY date_key DESC, datetime(created_at) DESC`
    ),
    db.getFirstAsync(
      `SELECT COUNT(*) as total_failures, COALESCE(SUM(amount_cents), 0) as total_amount_cents
       FROM penalties`
    )
  ]);

  return {
    rows,
    totalFailures: summary?.total_failures ?? 0,
    totalAmountCents: summary?.total_amount_cents ?? 0
  };
}
