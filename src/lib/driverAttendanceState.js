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

export function groupPassengersForStops(passengers = [], stopCount = 3) {
  const groups = Array.from({ length: Math.max(stopCount, 1) }, () => []);
  passengers.forEach((passenger, index) => {
    const groupIndex = Math.min(Math.floor(index * groups.length / Math.max(passengers.length, 1)), groups.length - 1);
    if (passenger.status !== ATTENDANCE_STATUS.CANCELLED) groups[groupIndex].push(passenger);
  });
  return groups;
}

export function firstPendingStop(groups = []) {
  const index = groups.findIndex((group) => group.some((passenger) => passenger.status === ATTENDANCE_STATUS.EXPECTED));
  return index === -1 ? groups.length : index;
}

export function employeeAttendanceCopy(record) {
  if (!record) return { label: 'Aguardando início', className: 'status-badge status-badge--neutral' };
  if (record.status === ATTENDANCE_STATUS.BOARDED) return { label: 'Embarque confirmado', className: 'status-badge status-badge--success' };
  if (record.status === ATTENDANCE_STATUS.ABSENT) return { label: 'Ausência registrada', className: 'status-badge status-badge--danger' };
  if (record.status === ATTENDANCE_STATUS.CANCELLED) return { label: 'Viagem cancelada', className: 'status-badge status-badge--neutral' };
  return { label: 'Aguardando embarque', className: 'status-badge status-badge--warning' };
}
