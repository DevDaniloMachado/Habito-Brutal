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

  const todayKey = useMemo(() => getLocalDateKey(), []);

  const refresh = useCallback(async () => {
    setError("");
    const [habitRows, checkRows] = await Promise.all([
      getHabits(),
      getTodayChecks(todayKey)
    ]);

    setHabits(habitRows);
    setChecks(checkRows);
    setStreak(await recalculateStreak(todayKey));
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
    async (habitId) => {
      await completeHabit(habitId, todayKey);
      await refresh();
    },
    [refresh, todayKey]
  );

  const checkedHabitIds = useMemo(
    () => new Set(checks.map((check) => check.habit_id)),
    [checks]
  );

  return {
    habits,
    checks,
    checkedHabitIds,
    streak,
    loading,
    error,
    todayKey,
    progress: habits.length === 0 ? 0 : checks.length / habits.length,
    addHabit,
    editHabit,
    removeHabit,
    markComplete
  };
}
