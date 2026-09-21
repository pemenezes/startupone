import assert from 'node:assert/strict';
import test from 'node:test';
import {
  PRESENTATION_STOPS, presentationPassengers, presentationStopIndex,
  reducePresentationJourney,
} from '../src/lib/presentationMobility.js';

const initial = { date: '2026-09-19', arrivedStops: [], statuses: {}, completed: false };

test('driver advances only after arriving and resolving passengers at each stop', () => {
  let state = reducePresentationJourney(initial, { type: 'attendance', passengerId: 'ana', status: 'boarded' });
  assert.equal(state, initial);
  state = reducePresentationJourney(state, { type: 'arrive', stopId: PRESENTATION_STOPS[0].id });
  assert.equal(presentationStopIndex(state), 0);
  state = reducePresentationJourney(state, { type: 'attendance', passengerId: 'ana', status: 'boarded' });
  assert.equal(presentationStopIndex(state), 0);
  state = reducePresentationJourney(state, { type: 'attendance', passengerId: 'bruno', status: 'absent' });
  assert.equal(presentationStopIndex(state), 1);
  assert.deepEqual(presentationPassengers(state).slice(0, 2).map((person) => person.status), ['boarded', 'absent']);
  state = reducePresentationJourney(state, { type: 'arrive', stopId: PRESENTATION_STOPS.at(-1).id });
  assert.equal(state.arrivedStops.length, 1);
});

test('completed journey can be restarted for another presentation', () => {
  const complete = { ...initial, completed: true, arrivedStops: PRESENTATION_STOPS.map((stop) => stop.id) };
  const restarted = reducePresentationJourney(complete, { type: 'restart' });
  assert.equal(restarted.completed, false);
  assert.deepEqual(restarted.arrivedStops, []);
  assert.equal(restarted.started, false);
});

test('driver can start a local journey before moving between stops', () => {
  const started = reducePresentationJourney(initial, { type: 'start' });
  assert.equal(started.started, true);
  assert.equal(started.completed, false);
  assert.deepEqual(started.arrivedStops, []);
});
