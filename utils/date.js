export function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function addDays(dateKey, amount) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + amount);
  return getLocalDateKey(date);
}

export function getWeekStart(dateKey = getLocalDateKey()) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  const dayOfWeek = date.getDay();
  const distanceFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  date.setDate(date.getDate() - distanceFromMonday);
  return getLocalDateKey(date);
}

export function getDateRange(startKey, days) {
  return Array.from({ length: days }, (_, index) => addDays(startKey, index));
}

export function formatShortDate(dateKey) {
  const [, month, day] = dateKey.split("-");
  return `${day}/${month}`;
}

export function formatTime(isoString) {
  if (!isoString) {
    return "";
  }

  return new Date(isoString).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit"
  });
}
