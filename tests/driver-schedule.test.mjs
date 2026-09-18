import assert from 'node:assert/strict';
import test from 'node:test';
import { todayISO, isoWeekday, isWeekdayScheduled } from '../src/lib/schedule.js';
import { driverDayStatus } from '../src/lib/driverSchedule.js';

test('late evening in Brasília remains on the same operating day', () => {
  const date = new Date('2026-09-07T23:30:00-03:00');
  assert.equal(todayISO(date), '2026-09-07');
  assert.equal(isoWeekday(date), 1);
  assert.equal(isWeekdayScheduled([1], date), true);
  assert.equal(isWeekdayScheduled([2], date), false);
});

test('the operating day changes at midnight in Brasília', () => {
  const date = new Date('2026-09-08T03:00:00Z');
  assert.equal(todayISO(date), '2026-09-08');
  assert.equal(isoWeekday(date), 2);
});

test('calendar and weekday agree at year boundaries', () => {
  const date = new Date('2027-01-01T01:00:00Z');
  assert.equal(todayISO(date), '2026-12-31');
  assert.equal(isoWeekday(date), 4);
});

test('a driver assignment is not operated before starts_on or on weekends', () => {
  const assignment = { starts_on: '2026-09-08', route: { active: true } };
  assert.equal(driverDayStatus(assignment, new Date('2026-09-07T12:00:00-03:00')), 'future');
  assert.equal(driverDayStatus(assignment, new Date('2026-09-08T12:00:00-03:00')), 'scheduled');
  assert.equal(driverDayStatus(assignment, new Date('2026-09-12T12:00:00-03:00')), 'weekend');
  assert.equal(driverDayStatus(assignment, new Date('2026-09-13T12:00:00-03:00')), 'weekend');
});

test('missing and unavailable routes are different from an empty passenger list', () => {
  assert.equal(driverDayStatus(null), 'unassigned');
  assert.equal(driverDayStatus({ starts_on: '2020-01-01', route: null }), 'unavailable');
  assert.equal(driverDayStatus({ route: { active: false } }), 'unavailable');
});
