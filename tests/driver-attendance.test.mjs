import assert from 'node:assert/strict';
import test from 'node:test';
import {
  attendanceCounts,
  employeeAttendanceCopy,
  firstPendingStop,
  groupPassengersForStops,
} from '../src/lib/driverAttendanceState.js';

const passengers = [
  { id: '1', status: 'boarded' },
  { id: '2', status: 'expected' },
  { id: '3', status: 'absent' },
  { id: '4', status: 'cancelled' },
];

test('attendance counts every persisted state', () => {
  assert.deepEqual(attendanceCounts(passengers), { expected: 1, boarded: 1, absent: 1, cancelled: 1 });
});

test('cancelled passengers are not assigned to boarding stops', () => {
  const groups = groupPassengersForStops(passengers, 3);
  assert.equal(groups.flat().some((passenger) => passenger.id === '4'), false);
  assert.equal(firstPendingStop(groups), 0);
  const cancelled = passengers.map((passenger) => passenger.id === '1' ? { ...passenger, status: 'cancelled' } : passenger);
  assert.equal(groupPassengersForStops(cancelled, 3)[0][0].id, '2');
});

test("employee copy reflects the driver's persisted action", () => {
  assert.equal(employeeAttendanceCopy(null).label, 'Aguardando início');
  assert.equal(employeeAttendanceCopy({ status: 'expected' }).label, 'Aguardando embarque');
  assert.equal(employeeAttendanceCopy({ status: 'boarded' }).label, 'Embarque confirmado');
  assert.equal(employeeAttendanceCopy({ status: 'absent' }).label, 'Ausência registrada');
});
