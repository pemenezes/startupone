import test from 'node:test';
import assert from 'node:assert/strict';
import {
  clearDemoRole, DEMO_PROFILES, demoSession, isDemoId, readDemoRole, resetDemoPreferences, writeDemoRole,
} from '../src/lib/demoAccess.js';

test('quick access gives each presentation role a matching local identity', () => {
  for (const [role, profile] of Object.entries(DEMO_PROFILES)) {
    assert.equal(profile.role, role);
    assert.equal(demoSession(role).user.id, profile.id);
    assert.equal(isDemoId(profile.id), true);
    assert.equal(Object.hasOwn(profile, 'password'), false);
  }
});

test('presentation reset only removes known local demo settings', () => {
  const originalEvent = globalThis.Event;
  const values = new Map([
    ['comfy:employee-route:demo-employee', 'route'],
    ['comfy:driver-region:demo-driver', 'region'],
    ['unrelated-user-data', 'keep'],
  ]);
  globalThis.window = {
    localStorage: { removeItem: (key) => values.delete(key) },
    dispatchEvent: () => {},
  };
  globalThis.Event = class { constructor(type) { this.type = type; } };
  try {
    resetDemoPreferences();
    assert.equal(values.has('comfy:employee-route:demo-employee'), false);
    assert.equal(values.has('comfy:driver-region:demo-driver'), false);
    assert.equal(values.get('unrelated-user-data'), 'keep');
  } finally {
    delete globalThis.window;
    globalThis.Event = originalEvent;
  }
});

test('presentation role survives reload and clears on exit', () => {
  const values = new Map();
  globalThis.window = { sessionStorage: {
    getItem: (key) => values.get(key) || null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
  } };
  try {
    writeDemoRole('driver');
    assert.equal(readDemoRole(), 'driver');
    clearDemoRole();
    assert.equal(readDemoRole(), null);
    assert.throws(() => writeDemoRole('unknown'));
  } finally {
    delete globalThis.window;
  }
});
