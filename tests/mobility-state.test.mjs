import test from 'node:test';
import assert from 'node:assert/strict';
import { activeStopIndex, journeyPosition, passengerJourneyCopy, stopPosition } from '../src/lib/mobilityState.js';

test('next stop waits for arrival and passenger decisions', () => {
  const stops = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];
  assert.equal(activeStopIndex(stops, [], []), 0);
  assert.equal(activeStopIndex(stops, [{ route_stop_id: 'a' }], [{ boarding_stop_id: 'a', status: 'expected' }]), 0);
  assert.equal(activeStopIndex(stops, [{ route_stop_id: 'a' }], [{ boarding_stop_id: 'a', status: 'boarded' }]), 1);
  assert.equal(activeStopIndex(stops, [{ route_stop_id: 'a' }, { route_stop_id: 'b' }], []), 2);
});

test('missing position never becomes a point at zero coordinates', () => {
  assert.equal(journeyPosition({ position_lat: null, position_lng: null }), null);
  assert.equal(stopPosition({ latitude: null, longitude: null }), null);
  assert.deepEqual(journeyPosition({ position_lat: -23.5, position_lng: -46.6 }), [-23.5, -46.6]);
});

test('passenger copy reflects persisted journey and attendance', () => {
  assert.equal(passengerJourneyCopy(null, null).label, 'Viagem programada');
  assert.equal(passengerJourneyCopy({ status: 'in_progress' }, { status: 'boarded' }).label, 'Em viagem');
  assert.equal(passengerJourneyCopy({ status: 'in_progress' }, { status: 'absent' }).label, 'Ausência registrada');
  assert.equal(passengerJourneyCopy({ status: 'in_progress', delay_minutes: 12 }, { status: 'expected' }).label, 'Van com atraso');
  assert.equal(passengerJourneyCopy({ status: 'completed' }, { status: 'boarded' }).label, 'Viagem concluída');
});
