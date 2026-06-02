import * as Notifications from "expo-notifications";
import { getDatabase } from "../database/db";

export async function configureDailyReminder() {
  const permission = await Notifications.requestPermissionsAsync();

  if (!permission.granted) {
    await saveNotificationSettings(null, false);
    return { enabled: false, identifier: null };
  }

  const current = await getNotificationSettings();

  if (current.daily_reminder_identifier) {
    await Notifications.cancelScheduledNotificationAsync(
      current.daily_reminder_identifier
    );
  }

  const identifier = await Notifications.scheduleNotificationAsync({
    content: {
      title: "Habito Brutal",
      body: "Vai falhar hoje?"
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 21,
      minute: 0
    }
  });

  await saveNotificationSettings(identifier, true);
  return { enabled: true, identifier };
}

export async function getNotificationSettings() {
  return getDatabase().getFirstAsync(
    "SELECT * FROM notification_settings WHERE id = 1"
  );
}

export async function notifyHabitCompleted(habitName) {
  await notifyNow("Habito concluido", `${habitName} foi esmagado hoje.`);
}

export async function notifyAllHabitsCompleted() {
  await notifyNow("Todos completos", "Disciplina entregue. Dia vencido.");
}

export async function notifyStreakLost() {
  await notifyNow("Streak perdido", "A falha virou multa. Recomece hoje.");
}

async function notifyNow(title, body) {
  const permission = await Notifications.getPermissionsAsync();

  if (!permission.granted) {
    return;
  }

  await Notifications.scheduleNotificationAsync({
    content: { title, body },
    trigger: null
  });
}

async function saveNotificationSettings(identifier, enabled) {
  await getDatabase().runAsync(
    `UPDATE notification_settings
     SET daily_reminder_enabled = ?,
         daily_reminder_identifier = ?,
         reminder_hour = 21,
         reminder_minute = 0,
         updated_at = ?
     WHERE id = 1`,
    [enabled ? 1 : 0, identifier, new Date().toISOString()]
  );
}
