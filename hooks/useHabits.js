import { useCallback, useEffect, useMemo, useState } from "react";
import { initDatabase } from "../database/db";
import {
  completeHabit,
  createHabit,
  deleteHabit,
  getHabits,
  getTodayChecks,
  updateHabit
} from "../services/habitService";
import { getDailyTimeline } from "../services/historyService";
import {
  configureDailyReminder,
  getNotificationSettings,
  notifyAllHabitsCompleted,
  notifyHabitCompleted,
  notifyStreakLost
} from "../services/notificationService";
import {
  getPenaltySummary,
  registerMissedHabitPenalties
} from "../services/penaltyService";
import { recalculateStreak } from "../services/streakService";
import { getLocalDateKey } from "../utils/date";

export function useHabits() {
  const [habits, setHabits] = useState([]);
  const [checks, setChecks] = useState([]);
  const [streak, setStreak] = useState({
    currentStreak: 0,
    bestStreak: 0,
    lastCompletedDate: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [penalties, setPenalties] = useState([]);
  const [penaltyTotalCents, setPenaltyTotalCents] = useState(0);
  const [penaltyFailures, setPenaltyFailures] = useState(0);
  const [timeline, setTimeline] = useState([]);
  const [notificationSettings, setNotificationSettings] = useState(null);

  const todayKey = useMemo(() => getLocalDateKey(), []);

  const refresh = useCallback(async () => {
    setError("");
    const missedPenalties = await registerMissedHabitPenalties(todayKey);
    const [habitRows, checkRows, penaltySummary, timelineRows, notificationRows] = await Promise.all([
      getHabits(),
      getTodayChecks(todayKey),
      getPenaltySummary(),
      getDailyTimeline(),
      getNotificationSettings()
    ]);

    setHabits(habitRows);
    setChecks(checkRows);
    setPenalties(penaltySummary.rows);
    setPenaltyTotalCents(penaltySummary.totalAmountCents);
    setPenaltyFailures(penaltySummary.totalFailures);
    setTimeline(timelineRows);
    setNotificationSettings(notificationRows);
    setStreak(await recalculateStreak(todayKey));

    if (missedPenalties > 0) {
      await notifyStreakLost();
    }
  }, [todayKey]);

  useEffect(() => {
    async function boot() {
      try {
        await initDatabase();
        await refresh();
      } catch (bootError) {
        setError(bootError.message);
      } finally {
        setLoading(false);
      }
    }

    boot();
  }, [refresh]);

  const addHabit = useCallback(
    async (habit) => {
      await createHabit(habit);
      await refresh();
    },
    [refresh]
  );

  const editHabit = useCallback(
    async (id, habit) => {
      await updateHabit(id, habit);
      await refresh();
    },
    [refresh]
  );

  const removeHabit = useCallback(
    async (id) => {
      await deleteHabit(id);
      await refresh();
    },
    [refresh]
  );

  const markComplete = useCallback(
    async (habitId, proofUri = null) => {
      const habit = habits.find((item) => item.id === habitId);
      await completeHabit(habitId, todayKey, proofUri);
      await refresh();
      await notifyHabitCompleted(habit?.name ?? "Habito");

      const totalChecks = (await getTodayChecks(todayKey)).length;
      const totalHabits = (await getHabits()).length;

      if (totalHabits > 0 && totalChecks >= totalHabits) {
        await notifyAllHabitsCompleted();
      }
    },
    [habits, refresh, todayKey]
  );

  const enableDailyReminder = useCallback(async () => {
    const settings = await configureDailyReminder();
    await refresh();
    return settings;
  }, [refresh]);

  const checkedHabitIds = useMemo(
    () => new Set(checks.map((check) => check.habit_id)),
    [checks]
  );

  return {
    habits,
    checks,
    checkedHabitIds,
    streak,
    penalties,
    penaltyTotalCents,
    penaltyFailures,
    timeline,
    notificationSettings,
    loading,
    error,
    todayKey,
    progress: habits.length === 0 ? 0 : checks.length / habits.length,
    addHabit,
    editHabit,
    removeHabit,
    markComplete,
    enableDailyReminder
  };
}
