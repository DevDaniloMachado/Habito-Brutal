import { getDatabase } from "../database/db";
import { addDays, getLocalDateKey, getWeekStart } from "../utils/date";

const HEATMAP_DAYS = 35;
const WEEKLY_BUCKETS = 8;
const MONTHLY_DAYS = 120;

export async function getAnalytics(todayKey = getLocalDateKey()) {
  const db = getDatabase();
  const [habits, checks, penalties] = await Promise.all([
    db.getAllAsync("SELECT * FROM habits ORDER BY datetime(created_at) ASC"),
    db.getAllAsync("SELECT habit_id, date_key, completed_at FROM habit_checks"),
    db.getAllAsync(
      `SELECT penalties.*, habits.name as habit_name, habits.icon as habit_icon
       FROM penalties
       LEFT JOIN habits ON habits.id = penalties.habit_id`
    )
  ]);

  const historyStart = habits[0]?.created_at?.slice(0, 10) ?? todayKey;
  const allDays = buildPerformanceDays(historyStart, todayKey, habits, checks);
  const heatmapStart = addDays(todayKey, -(HEATMAP_DAYS - 1));
  const heatmapDays = buildPerformanceDays(heatmapStart, todayKey, habits, checks);
  const weeklySeries = buildWeeklySeries(todayKey, habits, checks);
  const monthlySeries = buildMonthlySeries(todayKey, habits, checks);
  const difficultHabits = buildDifficultHabits(habits, checks, penalties, todayKey);
  const failureHours = buildFailureHours(penalties);
  const expectedTotal = allDays.reduce((sum, day) => sum + day.expected, 0);
  const completedTotal = allDays.reduce((sum, day) => sum + day.completed, 0);
  const failureTotal = penalties.length;

  return {
    completedTotal,
    expectedTotal,
    consistencyRate: expectedTotal === 0 ? 0 : Math.round((completedTotal / expectedTotal) * 100),
    failureTotal,
    heatmapDays,
    weeklySeries,
    monthlySeries,
    difficultHabits,
    failureHours
  };
}

export async function getWeeklyReportData(todayKey = getLocalDateKey()) {
  const db = getDatabase();
  const weekStart = getWeekStart(todayKey);
  const weekEnd = addDays(weekStart, 6);
  const [habits, checks, penalties] = await Promise.all([
    db.getAllAsync("SELECT * FROM habits ORDER BY datetime(created_at) ASC"),
    db.getAllAsync(
      "SELECT habit_id, date_key, completed_at FROM habit_checks WHERE date_key BETWEEN ? AND ?",
      [weekStart, weekEnd]
    ),
    db.getAllAsync(
      `SELECT penalties.*, habits.name as habit_name
       FROM penalties
       LEFT JOIN habits ON habits.id = penalties.habit_id
       WHERE penalties.date_key BETWEEN ? AND ?`,
      [weekStart, weekEnd]
    )
  ]);
  const days = buildPerformanceDays(weekStart, weekEnd, habits, checks);
  const expected = days.reduce((sum, day) => sum + day.expected, 0);
  const completed = days.reduce((sum, day) => sum + day.completed, 0);
  const completionRate = expected === 0 ? 0 : Math.round((completed / expected) * 100);

  return {
    weekStart,
    weekEnd,
    days,
    completed,
    expected,
    completionRate,
    failures: penalties.length,
    penalties
  };
}

function buildPerformanceDays(startKey, endKey, habits, checks) {
  const checkMap = checks.reduce((map, check) => {
    const key = `${check.date_key}:${check.habit_id}`;
    map[key] = true;
    return map;
  }, {});
  const days = [];
  let cursor = startKey;

  while (cursor <= endKey) {
    const activeHabits = habits.filter((habit) => habit.created_at.slice(0, 10) <= cursor);
    const completed = activeHabits.filter((habit) => checkMap[`${cursor}:${habit.id}`]).length;
    const expected = activeHabits.length;
    const rate = expected === 0 ? 0 : completed / expected;

    days.push({
      dateKey: cursor,
      completed,
      expected,
      failures: Math.max(expected - completed, 0),
      rate,
      level: getHeatLevel(rate, expected)
    });

    cursor = addDays(cursor, 1);
  }

  return days;
}

function buildWeeklySeries(todayKey, habits, checks) {
  const currentWeekStart = getWeekStart(todayKey);

  return Array.from({ length: WEEKLY_BUCKETS }, (_, index) => {
    const weekStart = addDays(currentWeekStart, -7 * (WEEKLY_BUCKETS - 1 - index));
    const weekEnd = addDays(weekStart, 6);
    const days = buildPerformanceDays(weekStart, weekEnd, habits, checks);
    return summarizeRange(weekStart, days);
  });
}

function buildMonthlySeries(todayKey, habits, checks) {
  const startKey = addDays(todayKey, -(MONTHLY_DAYS - 1));
  const days = buildPerformanceDays(startKey, todayKey, habits, checks);
  const grouped = days.reduce((map, day) => {
    const monthKey = day.dateKey.slice(0, 7);
    map[monthKey] = map[monthKey] ?? [];
    map[monthKey].push(day);
    return map;
  }, {});

  return Object.entries(grouped).map(([monthKey, monthDays]) => {
    return summarizeRange(monthKey.slice(5), monthDays);
  });
}

function buildDifficultHabits(habits, checks, penalties, todayKey) {
  const checkSet = new Set(checks.map((check) => `${check.date_key}:${check.habit_id}`));

  return habits.map((habit) => {
    let expected = 0;
    let completed = 0;
    let cursor = habit.created_at.slice(0, 10);

    while (cursor <= todayKey) {
      expected += 1;
      if (checkSet.has(`${cursor}:${habit.id}`)) {
        completed += 1;
      }
      cursor = addDays(cursor, 1);
    }

    const penaltyCount = penalties.filter((penalty) => penalty.habit_id === habit.id).length;
    const rate = expected === 0 ? 0 : Math.round((completed / expected) * 100);

    return {
      id: habit.id,
      name: habit.name,
      icon: habit.icon,
      color: habit.color,
      rate,
      penaltyCount,
      missed: Math.max(expected - completed, 0)
    };
  }).sort((a, b) => {
    if (b.penaltyCount !== a.penaltyCount) {
      return b.penaltyCount - a.penaltyCount;
    }

    return a.rate - b.rate;
  });
}

function buildFailureHours(penalties) {
  const buckets = penalties.reduce((map, penalty) => {
    const hour = new Date(penalty.created_at).getHours();
    const label = `${String(hour).padStart(2, "0")}h`;
    map[label] = (map[label] ?? 0) + 1;
    return map;
  }, {});

  return Object.entries(buckets)
    .map(([hour, total]) => ({ hour, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 4);
}

function summarizeRange(label, days) {
  const expected = days.reduce((sum, day) => sum + day.expected, 0);
  const completed = days.reduce((sum, day) => sum + day.completed, 0);

  return {
    label,
    expected,
    completed,
    rate: expected === 0 ? 0 : Math.round((completed / expected) * 100)
  };
}

function getHeatLevel(rate, expected) {
  if (expected === 0) {
    return 0;
  }

  if (rate >= 1) {
    return 4;
  }

  if (rate >= 0.66) {
    return 3;
  }

  if (rate >= 0.33) {
    return 2;
  }

  return 1;
}
