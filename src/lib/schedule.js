/** ISO weekday: 1=Mon ... 7=Sun */
export function isoWeekday(date = new Date()) {
  const js = new Date(`${todayISO(date)}T12:00:00Z`).getUTCDay();
  return js === 0 ? 7 : js;
}

export function todayISO(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(date);
  const value = (type) => parts.find((part) => part.type === type).value;
  return `${value('year')}-${value('month')}-${value('day')}`;
}

export function parseWeekdays(raw) {
  if (Array.isArray(raw)) return raw.map(Number).filter((n) => n >= 1 && n <= 7);
  if (typeof raw === 'string') {
    try {
      return parseWeekdays(JSON.parse(raw));
    } catch {
      return [1, 2, 3, 4, 5];
    }
  }
  return [1, 2, 3, 4, 5];
}

export function isWeekdayScheduled(weekdays, date = new Date()) {
  return parseWeekdays(weekdays).includes(isoWeekday(date));
}

export const WEEKDAY_OPTIONS = [
  { value: 1, label: 'Seg' },
  { value: 2, label: 'Ter' },
  { value: 3, label: 'Qua' },
  { value: 4, label: 'Qui' },
  { value: 5, label: 'Sex' },
];

export function directionLabel(direction) {
  return direction === 'return' ? 'Volta' : 'Ida';
}
