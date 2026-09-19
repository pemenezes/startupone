export const JOURNEY_STATUS = Object.freeze({
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
});

export function journeyDisplayState(record, dayStatus) {
  if (record?.status === JOURNEY_STATUS.IN_PROGRESS) return JOURNEY_STATUS.IN_PROGRESS;
  if (dayStatus !== 'scheduled') return 'unavailable';
  if (!record) return 'planned';
  if (Object.values(JOURNEY_STATUS).includes(record.status)) return record.status;
  return 'unavailable';
}

export function formatJourneyTime(value) {
  if (!value) return 'Não registrado';
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}
