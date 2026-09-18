import assert from 'node:assert/strict';
import test from 'node:test';
import { advanceJourney, initialJourney, createDemoRoute, DEMO_ORIGIN, navigationUrl } from '../src/lib/driverDemo.js';

test('demo has three boarding stops, one destination and five fictitious passengers', () => {
  const stops = createDemoRoute();
  assert.equal(stops.length, 4);
  assert.equal(stops.filter((s) => !s.destination).length, 3);
  assert.equal(stops.at(-1).destination, true);
  assert.equal(stops.reduce((total, s) => total + s.passengers.length, 0), 5);
  assert.equal(new Set(stops.map((s) => s.id)).size, 4);
});

test('demo follows the chosen origin without mutating it', () => {
  const origin = Object.freeze([-22.9, -43.2]);
  const stops = createDemoRoute(origin);
  assert.notDeepEqual(stops, createDemoRoute(DEMO_ORIGIN));
  assert.deepEqual(stops, createDemoRoute(origin));
  for (const stop of stops) {
    assert(Math.abs(stop.position[0] - origin[0]) < 0.02);
    assert(Math.abs(stop.position[1] - origin[1]) < 0.02);
  }
});

test('desktop fallback receives the precise destination and driving navigation', () => {
  const url = new URL(navigationUrl([-23.55, -46.63], 'Windows'));
  assert.equal(url.origin, 'https://www.google.com');
  assert.equal(url.searchParams.get('api'), '1');
  assert.equal(url.searchParams.get('destination'), '-23.55,-46.63');
  assert.equal(url.searchParams.get('travelmode'), 'driving');
  assert.equal(url.searchParams.get('dir_action'), 'navigate');
});

test('mobile navigation delegates to platform links without a saved app preference', () => {
  assert.equal(navigationUrl([-23.55, -46.63], 'Android'), 'geo:-23.55,-46.63?q=-23.55%2C-46.63');
  const url = new URL(navigationUrl([-23.55, -46.63], 'iPhone'));
  assert.equal(url.origin, 'https://maps.apple.com');
  assert.equal(url.searchParams.get('daddr'), '-23.55,-46.63');
  assert.equal(url.searchParams.get('dirflg'), 'd');
});

test('arrival is mandatory and stale, invalid or duplicate attendance cannot skip stops', () => {
  const stops = createDemoRoute();
  const board = { type: 'attendance', stopId: 1, passenger: 'Ana', status: 'boarded' };
  assert.equal(advanceJourney(initialJourney, board, stops), initialJourney);
  assert.equal(advanceJourney(initialJourney, { type: 'arrive', stopId: 2 }, stops), initialJourney);
  let state = advanceJourney(initialJourney, { type: 'arrive', stopId: 1 }, stops);
  assert.equal(advanceJourney(state, { ...board, passenger: 'Unknown' }, stops), state);
  assert.equal(advanceJourney(state, { ...board, status: 'invalid' }, stops), state);
  state = advanceJourney(state, board, stops);
  assert.equal(state.index, 0);
  assert.equal(advanceJourney(state, { ...board, status: 'absent' }, stops), state);
  state = advanceJourney(state, { ...board, passenger: 'Bruno', status: 'absent' }, stops);
  assert.equal(state.index, 1);
  assert.equal(state.arrived, false);
  assert.equal(advanceJourney(state, board, stops), state);
});

test('each stop requires arrival and all passengers; final arrival completes the journey', () => {
  const stops = createDemoRoute();
  let state = initialJourney;
  for (const stop of stops) {
    assert.equal(stops[state.index].id, stop.id);
    assert.equal(state.complete, false);
    state = advanceJourney(state, { type: 'arrive', stopId: stop.id }, stops);
    for (const passenger of stop.passengers) state = advanceJourney(state, { type: 'attendance', stopId: stop.id, passenger, status: 'boarded' }, stops);
  }
  assert.equal(state.complete, true);
  assert.equal(Object.keys(state.attendance).length, 5);
  assert.equal(advanceJourney(state, { type: 'arrive', stopId: 4 }, stops), state);
  assert.deepEqual(initialJourney.attendance, {});
});
