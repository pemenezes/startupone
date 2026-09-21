import assert from 'node:assert/strict';
import test from 'node:test';
import {
  EMPLOYEE_ROUTE_OPTIONS, readEmployeeRoutePreferences,
  saveEmployeeRoutePreference, selectedEmployeeRoute,
} from '../src/lib/employeeRoutePreferences.js';

test('route choices cover ida and volta with map coordinates', () => {
  assert.equal(EMPLOYEE_ROUTE_OPTIONS.filter((route) => route.direction === 'outbound').length, 2);
  assert.equal(EMPLOYEE_ROUTE_OPTIONS.filter((route) => route.direction === 'return').length, 2);
  for (const route of EMPLOYEE_ROUTE_OPTIONS) {
    assert.equal(route.stops.length, 4);
    assert.equal(route.stops.at(-1).destination, true);
    assert.equal(route.stops.every((stop) => stop.position.length === 2), true);
  }
});

test('route and weekdays remain selected separately for ida and volta', () => {
  const previousWindow = globalThis.window;
  const values = new Map();
  globalThis.window = {
    localStorage: {
      getItem: (key) => values.get(key) || null,
      setItem: (key, value) => values.set(key, value),
    },
    dispatchEvent: () => {},
  };
  try {
    saveEmployeeRoutePreference('employee-1', 'outbound', 'comfy-centro-ida', [1, 3, 5]);
    saveEmployeeRoutePreference('employee-1', 'return', 'comfy-pinheiros-volta', [2, 4]);
    const choice = readEmployeeRoutePreferences('employee-1');
    assert.deepEqual(choice.outbound.weekdays, [1, 3, 5]);
    assert.deepEqual(choice.return.weekdays, [2, 4]);
    assert.equal(selectedEmployeeRoute('employee-1').id, 'comfy-pinheiros-volta');
  } finally {
    globalThis.window = previousWindow;
  }
});
