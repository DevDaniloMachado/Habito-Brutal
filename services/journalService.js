import { getDatabase } from "../database/db";

export async function getDailyNote(dateKey) {
  const note = await getDatabase().getFirstAsync(
    "SELECT * FROM daily_notes WHERE date_key = ?",
    [dateKey]
  );

  return {
    successReason: note?.success_reason ?? "",
    failureReason: note?.failure_reason ?? ""
  };
}

export async function saveDailyNote(dateKey, { successReason, failureReason }) {
  await getDatabase().runAsync(
    `INSERT INTO daily_notes (date_key, success_reason, failure_reason, updated_at)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(date_key) DO UPDATE SET
       success_reason = excluded.success_reason,
       failure_reason = excluded.failure_reason,
       updated_at = excluded.updated_at`,
    [
      dateKey,
      successReason.trim(),
      failureReason.trim(),
      new Date().toISOString()
    ]
  );
}
