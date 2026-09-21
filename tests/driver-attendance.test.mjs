import assert from 'node:assert/strict';
import test from 'node:test';
import {
  attendanceCounts,
  employeeAttendanceCopy,
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

test("employee copy reflects the driver's persisted action", () => {
  assert.equal(employeeAttendanceCopy(null).label, 'Aguardando início');
  assert.equal(employeeAttendanceCopy({ status: 'expected' }).label, 'Aguardando embarque');
  assert.equal(employeeAttendanceCopy({ status: 'boarded' }).label, 'Embarque confirmado');
  assert.equal(employeeAttendanceCopy({ status: 'absent' }).label, 'Ausência registrada');
});
