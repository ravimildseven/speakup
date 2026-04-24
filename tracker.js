const STORAGE_KEY = 'nativespeakup_practice_log';

export function markPracticed() {
  const log = getLog();
  const today = todayKey();
  if (!log[today]) log[today] = { count: 0 };
  log[today].count += 1;
  saveLog(log);
}

export function getLog() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

export function getStreak() {
  const log = getLog();
  const d = new Date();
  let streak = 0;
  while (true) {
    const key = dateKey(d);
    if (!log[key] || log[key].count === 0) break;
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

export function getTotalSessions() {
  return Object.values(getLog()).reduce((sum, day) => sum + (day.count || 0), 0);
}

export function getTotalDays() {
  return Object.values(getLog()).filter(day => day.count > 0).length;
}

function todayKey() {
  return dateKey(new Date());
}

export function dateKey(d) {
  return d.toISOString().slice(0, 10);
}

function saveLog(log) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(log));
}
