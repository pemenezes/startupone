export const ATTENDANCE_STATUS = Object.freeze({
  EXPECTED: 'expected',
  BOARDED: 'boarded',
  ABSENT: 'absent',
  CANCELLED: 'cancelled',
});

export function attendanceCounts(passengers = []) {
  return passengers.reduce((counts, passenger) => {
    if (Object.hasOwn(counts, passenger.status)) counts[passenger.status] += 1;
    return counts;
  }, { expected: 0, boarded: 0, absent: 0, cancelled: 0 });
}

export function employeeAttendanceCopy(record) {
  if (!record) return { label: 'Aguardando início', className: 'status-badge status-badge--neutral' };
  if (record.status === ATTENDANCE_STATUS.BOARDED) return { label: 'Embarque confirmado', className: 'status-badge status-badge--success' };
  if (record.status === ATTENDANCE_STATUS.ABSENT) return { label: 'Ausência registrada', className: 'status-badge status-badge--danger' };
  if (record.status === ATTENDANCE_STATUS.CANCELLED) return { label: 'Viagem cancelada', className: 'status-badge status-badge--neutral' };
  return { label: 'Aguardando embarque', className: 'status-badge status-badge--warning' };
}
