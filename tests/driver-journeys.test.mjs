import assert from 'node:assert/strict';
import test from 'node:test';
import { JOURNEY_STATUS, formatJourneyTime, journeyDisplayState } from '../src/lib/driverJourneyState.js';

test('scheduled days without a record are planned and resumable records keep their state', () => {
  assert.equal(journeyDisplayState(null, 'scheduled'), 'planned');
  assert.equal(journeyDisplayState({ status: JOURNEY_STATUS.IN_PROGRESS }, 'scheduled'), 'in_progress');
  assert.equal(journeyDisplayState({ status: JOURNEY_STATUS.COMPLETED }, 'scheduled'), 'completed');
  assert.equal(journeyDisplayState({ status: JOURNEY_STATUS.CANCELLED }, 'scheduled'), 'cancelled');
});

test('operations outside a scheduled day cannot be started from the interface', () => {
  assert.equal(journeyDisplayState(null, 'weekend'), 'unavailable');
  assert.equal(journeyDisplayState(null, 'future'), 'unavailable');
  assert.equal(journeyDisplayState({ status: 'unexpected' }, 'scheduled'), 'unavailable');
});

test('an open journey remains resumable after its service day changes', () => {
  assert.equal(journeyDisplayState({ status: JOURNEY_STATUS.IN_PROGRESS }, 'weekend'), 'in_progress');
  assert.equal(journeyDisplayState({ status: JOURNEY_STATUS.COMPLETED }, 'weekend'), 'completed');
});

test('journey timestamps are shown in Brasilia time', () => {
  assert.equal(formatJourneyTime('2026-09-18T13:45:00Z'), '10:45');
  assert.equal(formatJourneyTime(null), 'Não registrado');
});
