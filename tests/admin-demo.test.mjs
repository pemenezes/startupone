import assert from 'node:assert/strict';
import test from 'node:test';
import {
  adminEmployees, adminRoutes, adminSummary, criticalRoutes,
  filterAdminRoutes, routeBoarded, routeHistory, routeOccupancy,
} from '../src/data/adminDemo.js';

test('administrative example uses consistent route and employee relationships', () => {
  const employeeIds = new Set(adminEmployees.map((employee) => employee.id));
  for (const route of adminRoutes) {
    for (const passenger of route.passengers) {
      assert.equal(employeeIds.has(passenger.id), true);
      assert.equal(adminEmployees.find((employee) => employee.id === passenger.id).routeId, route.id);
    }
  }
  assert.equal(routeBoarded(adminRoutes[0]), 4);
  assert.equal(routeOccupancy(adminRoutes[0]), 80);
});

test('summary and critical list derive from the same routes', () => {
  const summary = adminSummary();
  assert.equal(summary.employees, 12);
  assert.deepEqual(summary.routes, { total: 4, inProgress: 2, completed: 1, planned: 1 });
  assert.equal(summary.occupancy, 47);
  assert.deepEqual(criticalRoutes().map((route) => route.id), ['RT-42', 'RT-08']);
});

test('route filters cover region, status, id, driver and plate', () => {
  assert.deepEqual(filterAdminRoutes(adminRoutes, { region: 'Zona Norte' }).map((route) => route.id), ['RT-42']);
  assert.deepEqual(filterAdminRoutes(adminRoutes, { status: 'completed' }).map((route) => route.id), ['RT-08']);
  for (const query of ['RT-14', 'Carlos', 'ABC-1234']) assert.deepEqual(filterAdminRoutes(adminRoutes, { query }).map((route) => route.id), ['RT-14']);
  assert.equal(routeHistory(adminRoutes[0]).length, 30);
});
