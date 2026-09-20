import assert from 'node:assert/strict';
import test from 'node:test';
import {
  adminSummary, criticalRoutes, filterAdminRoutes, routeBoarded,
  routeHistory, routeOccupancy,
} from '../src/data/adminDemo.js';

const routes = [
  { id: 'a', code: 'RT-14', name: 'Campus', region: 'Centro', driver: 'Carlos', plate: 'ABC-1234', status: 'in_progress', capacity: 5, passengers: [{ status: 'boarded' }, { status: 'boarded' }] },
  { id: 'b', code: 'RT-42', name: 'Norte', region: 'Zona Norte', driver: 'Luiz', plate: 'DEF-5678', status: 'planned', capacity: 4, passengers: [] },
  { id: 'c', code: 'RT-08', name: 'Sul', region: 'Zona Sul', driver: 'Ana', plate: 'GHI-9999', status: 'completed', capacity: 5, passengers: [{ status: 'boarded' }] },
];

test('operation metrics derive from route and passenger state', () => {
  assert.equal(routeBoarded(routes[0]), 2);
  assert.equal(routeOccupancy(routes[0]), 40);
  assert.deepEqual(adminSummary(routes, [{}, {}], [{ id: 1 }]), {
    employees: 2, occupancy: 30,
    routes: { total: 3, inProgress: 1, completed: 1, planned: 1 },
    occurrences: 1,
  });
  assert.deepEqual(criticalRoutes(routes).map((route) => route.id), ['a', 'c']);
  assert.deepEqual(criticalRoutes([...routes, { id: 'cancelled', status: 'cancelled', capacity: 5, passengers: [] }]).map((route) => route.id), ['a', 'c']);
  assert.deepEqual(routeHistory(routes[0]), []);
});

test('route filters match code, status, region, driver and plate', () => {
  assert.deepEqual(filterAdminRoutes(routes, { region: 'Zona Norte' }).map((route) => route.id), ['b']);
  assert.deepEqual(filterAdminRoutes(routes, { status: 'completed' }).map((route) => route.id), ['c']);
  for (const query of ['RT-14', 'Carlos', 'ABC-1234']) {
    assert.deepEqual(filterAdminRoutes(routes, { query }).map((route) => route.id), ['a']);
  }
});
