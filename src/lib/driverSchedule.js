import { isoWeekday, todayISO } from './schedule.js';

export function driverDayStatus(assignment, date = new Date()) {
  if (!assignment) return 'unassigned';
  if (!assignment.route?.active) return 'unavailable';
  if (assignment.starts_on > todayISO(date)) return 'future';
  return isoWeekday(date) <= 5 ? 'scheduled' : 'weekend';
}

export function formatDriverDate(value) {
  if (!value) return 'Não informado';
  return new Date(`${value}T12:00:00Z`).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
}

