import { getDatabase } from "../database/db";
import { addDays, getLocalDateKey } from "../utils/date";

export async function recalculateStreak(todayKey = getLocalDateKey()) {
  const db = getDatabase();
  const habits = await db.getAllAsync(
    "SELECT id, created_at FROM habits ORDER BY id ASC"
  );
  const state = await db.getFirstAsync("SELECT * FROM streak_state WHERE id = 1");

  if (habits.length === 0) {
    await db.runAsync(
      "UPDATE streak_state SET current_streak = 0, last_completed_date = NULL WHERE id = 1"
    );
    return {
      currentStreak: 0,
      bestStreak: state?.best_streak ?? 0,
      lastCompletedDate: null
    };
  }

  const checkedDays = await db.getAllAsync(
    `SELECT date_key, habit_id
     FROM habit_checks
     WHERE habit_id IN (SELECT id FROM habits)
     ORDER BY date_key DESC`
  );

  const checksByDay = checkedDays.reduce((map, row) => {
    if (!map[row.date_key]) {
      map[row.date_key] = new Set();
    }

    map[row.date_key].add(row.habit_id);
    return map;
  }, {});
  const completeSet = new Set();

  for (const [dateKey, checkedHabitIds] of Object.entries(checksByDay)) {
    const expectedHabitCount = habits.filter((habit) => {
      return habit.created_at.slice(0, 10) <= dateKey;
    }).length;

    if (expectedHabitCount > 0 && checkedHabitIds.size === expectedHabitCount) {
      completeSet.add(dateKey);
    }
  }

  const todayComplete = completeSet.has(todayKey);
  const yesterdayKey = addDays(todayKey, -1);
  let cursor = todayComplete ? todayKey : yesterdayKey;
  let currentStreak = 0;

  while (completeSet.has(cursor)) {
    currentStreak += 1;
    cursor = addDays(cursor, -1);
  }

  const completedDateKeys = [...completeSet];
  const bestFromHistory = calculateBestStreak(completedDateKeys);
  const bestStreak = Math.max(state?.best_streak ?? 0, bestFromHistory, currentStreak);
  const lastCompletedDate = completedDateKeys.sort().at(-1) ?? null;

  await db.runAsync(
    `UPDATE streak_state
     SET current_streak = ?, best_streak = ?, last_completed_date = ?
     WHERE id = 1`,
    [currentStreak, bestStreak, lastCompletedDate]
  );

  return {
    currentStreak,
    bestStreak,
    lastCompletedDate
  };
}

function calculateBestStreak(dateKeys) {
  const ascending = [...dateKeys].sort();
  let best = 0;
  let current = 0;
  let previous = null;

  for (const dateKey of ascending) {
    if (previous && addDays(previous, 1) === dateKey) {
      current += 1;
    } else {
      current = 1;
    }

    best = Math.max(best, current);
    previous = dateKey;
  }

  return best;
}
