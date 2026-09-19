import assert from 'node:assert/strict';
import test from 'node:test';
import {
  exampleActiveStop, exampleCounts, examplePassengerStatus,
  initialExampleJourney, reduceExampleJourney,
} from '../src/lib/exampleJourney.js';

const at = '2026-09-19T10:00:00.000Z';
const run = (state, action) => reduceExampleJourney(state, { ...action, at });

test('example requires start and arrival before boarding', () => {
  let state = initialExampleJourney();
  assert.equal(run(state, { type: 'record', passengerId: 'ana', status: 'boarded' }), state);
  state = run(state, { type: 'start' });
  assert.equal(run(state, { type: 'record', passengerId: 'ana', status: 'boarded' }), state);
  state = run(state, { type: 'arrive', stopId: 1 });
  state = run(state, { type: 'record', passengerId: 'ana', status: 'boarded' });
  assert.equal(examplePassengerStatus(state, 'ana'), 'boarded');
  assert.equal(exampleActiveStop(state), 1);
  assert.equal(state.history.length, 1);
});

test('example persists corrections in history and blocks premature completion', () => {
  let state = run(initialExampleJourney(), { type: 'start' });
  state = run(state, { type: 'arrive', stopId: 1 });
  state = run(state, { type: 'record', passengerId: 'ana', status: 'absent' });
  state = run(state, { type: 'record', passengerId: 'ana', status: 'boarded' });
  assert.deepEqual(state.history.map((event) => [event.previous, event.status]), [['expected', 'absent'], ['absent', 'boarded']]);
  assert.equal(exampleCounts(state).expected, 3);
  assert.equal(run(state, { type: 'complete' }), state);
});

test('example advances one stop at a time and completes after all passengers', () => {
  let state = run(initialExampleJourney(), { type: 'start' });
  for (const [stopId, passengerIds] of [[1, ['ana', 'bruno']], [2, ['carla']], [3, ['diego']]]) {
    assert.equal(exampleActiveStop(state), stopId);
    state = run(state, { type: 'arrive', stopId });
    for (const passengerId of passengerIds) state = run(state, { type: 'record', passengerId, status: 'boarded' });
  }
  assert.equal(exampleActiveStop(state), 4);
  assert.equal(run(state, { type: 'complete' }), state);
  state = run(state, { type: 'arrive', stopId: 4 });
  state = run(state, { type: 'complete' });
  assert.equal(state.completedAt, at);
  assert.equal(run(state, { type: 'record', passengerId: 'ana', status: 'absent' }), state);
  assert.deepEqual(run(state, { type: 'reset' }), initialExampleJourney());
});
