import { getDatabase } from "../database/db";

export async function getDailyTimeline() {
  const db = getDatabase();
  const checks = await db.getAllAsync(
    `SELECT habit_checks.date_key,
            habit_checks.completed_at as occurred_at,
            habits.name as habit_name,
            habits.icon as habit_icon,
            habits.color as habit_color,
            proof_photos.image_uri
     FROM habit_checks
     LEFT JOIN habits ON habits.id = habit_checks.habit_id
     LEFT JOIN proof_photos ON proof_photos.check_id = habit_checks.id
     ORDER BY date_key DESC, datetime(occurred_at) DESC`
  );
  const penalties = await db.getAllAsync(
    `SELECT penalties.date_key,
            penalties.created_at as occurred_at,
            penalties.amount_cents,
            penalties.reason,
            habits.name as habit_name,
            habits.icon as habit_icon,
            habits.color as habit_color
     FROM penalties
     LEFT JOIN habits ON habits.id = penalties.habit_id
     ORDER BY date_key DESC, datetime(occurred_at) DESC`
  );
  const notes = await db.getAllAsync(
    `SELECT date_key,
            updated_at as occurred_at,
            success_reason,
            failure_reason
     FROM daily_notes
     ORDER BY date_key DESC, datetime(updated_at) DESC`
  );

  const events = [
    ...checks.map((check) => ({
      ...check,
      id: `check-${check.date_key}-${check.habit_name}-${check.occurred_at}`,
      type: check.image_uri ? "proof" : "check",
      title: check.image_uri ? "Prova enviada" : "Habito concluido"
    })),
    ...penalties.map((penalty) => ({
      ...penalty,
      id: `penalty-${penalty.date_key}-${penalty.habit_name}-${penalty.occurred_at}`,
      type: "penalty",
      title: "Multa registrada"
    })),
    ...notes.map((note) => ({
      ...note,
      id: `note-${note.date_key}-${note.occurred_at}`,
      type: "note",
      habit_name: note.success_reason || note.failure_reason,
      title: "Diario registrado"
    }))
  ];

  return events.sort((a, b) => {
    if (a.date_key !== b.date_key) {
      return b.date_key.localeCompare(a.date_key);
    }

    return (b.occurred_at ?? "").localeCompare(a.occurred_at ?? "");
  });
}
