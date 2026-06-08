import * as FileSystem from "expo-file-system";
import * as Print from "expo-print";
import { getDatabase } from "../database/db";
import { getWeeklyReportData } from "./analyticsService";

export async function generateWeeklyPdf(streak, todayKey) {
  const report = await getWeeklyReportData(todayKey);
  const html = buildReportHtml(report, streak);
  const printed = await Print.printToFileAsync({ html });
  const directory = `${FileSystem.documentDirectory}reports/`;
  const info = await FileSystem.getInfoAsync(directory);

  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(directory, { intermediates: true });
  }

  const destination = `${directory}semana-${report.weekStart}.pdf`;
  const existing = await FileSystem.getInfoAsync(destination);

  if (existing.exists) {
    await FileSystem.deleteAsync(destination, { idempotent: true });
  }

  await FileSystem.copyAsync({ from: printed.uri, to: destination });

  await getDatabase().runAsync(
    `INSERT INTO weekly_reports (
       week_start,
       week_end,
       file_uri,
       completion_rate,
       failures,
       created_at
     )
     VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT(week_start) DO UPDATE SET
       week_end = excluded.week_end,
       file_uri = excluded.file_uri,
       completion_rate = excluded.completion_rate,
       failures = excluded.failures,
       created_at = excluded.created_at`,
    [
      report.weekStart,
      report.weekEnd,
      destination,
      report.completionRate,
      report.failures,
      new Date().toISOString()
    ]
  );

  return {
    ...report,
    fileUri: destination
  };
}

function buildReportHtml(report, streak) {
  const verdict = getVerdict(report.completionRate);
  const rows = report.days
    .map((day) => {
      const percent = day.expected === 0 ? 0 : Math.round(day.rate * 100);
      return `
        <tr>
          <td>${day.dateKey}</td>
          <td>${day.completed}/${day.expected}</td>
          <td>${percent}%</td>
          <td>${day.failures}</td>
        </tr>
      `;
    })
    .join("");

  return `
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { background: #080808; color: #f2f2f2; font-family: Arial, sans-serif; padding: 32px; }
          h1 { font-size: 36px; margin: 0 0 8px; text-transform: uppercase; }
          h2 { font-size: 18px; color: #ff453a; text-transform: uppercase; margin-top: 28px; }
          .muted { color: #9a9a9a; font-weight: 700; }
          .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin: 24px 0; }
          .card { border: 2px solid #2b2b2b; border-radius: 8px; padding: 16px; background: #111; }
          .value { font-size: 30px; font-weight: 900; margin-top: 6px; }
          table { width: 100%; border-collapse: collapse; margin-top: 12px; }
          th, td { border-bottom: 1px solid #333; text-align: left; padding: 10px; }
          th { color: #9a9a9a; text-transform: uppercase; font-size: 12px; }
          .verdict { border: 2px solid #ff453a; padding: 18px; border-radius: 8px; font-size: 24px; font-weight: 900; }
        </style>
      </head>
      <body>
        <p class="muted">Habito Brutal - ${report.weekStart} a ${report.weekEnd}</p>
        <h1>Relatorio semanal</h1>
        <div class="verdict">${verdict}</div>
        <div class="grid">
          <div class="card"><span class="muted">Conclusao</span><div class="value">${report.completionRate}%</div></div>
          <div class="card"><span class="muted">Concluidos</span><div class="value">${report.completed}/${report.expected}</div></div>
          <div class="card"><span class="muted">Falhas</span><div class="value">${report.failures}</div></div>
          <div class="card"><span class="muted">Streak</span><div class="value">${streak.currentStreak}</div></div>
        </div>
        <h2>Resumo da semana</h2>
        <p class="muted">Melhor streak registrado: ${streak.bestStreak}. Se a porcentagem incomoda, bom. Dado existe para cortar desculpa.</p>
        <table>
          <thead>
            <tr><th>Dia</th><th>Checks</th><th>Consistencia</th><th>Falhas</th></tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </body>
    </html>
  `;
}

function getVerdict(rate) {
  if (rate >= 90) {
    return `Voce cumpriu ${rate}%. Continue perigoso.`;
  }

  if (rate >= 70) {
    return `Voce cumpriu ${rate}%. Bom, mas ainda tem fuga.`;
  }

  return `Voce cumpriu ${rate}%. Pode melhor.`;
}
