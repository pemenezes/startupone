import assert from 'node:assert/strict';
import test from 'node:test';
import { navigationUrl } from '../src/lib/driverNavigation.js';

test('desktop navigation includes exact destination and driving mode', () => {
  const url = new URL(navigationUrl([-23.55, -46.63], 'Windows'));
  assert.equal(url.searchParams.get('destination'), '-23.55,-46.63');
  assert.equal(url.searchParams.get('travelmode'), 'driving');
});

test('mobile navigation delegates to the device', () => {
  assert.equal(navigationUrl([-23.55, -46.63], 'Android'), 'geo:-23.55,-46.63?q=-23.55%2C-46.63');
  const url = new URL(navigationUrl([-23.55, -46.63], 'iPhone'));
  assert.equal(url.origin, 'https://maps.apple.com');
  assert.equal(url.searchParams.get('daddr'), '-23.55,-46.63');
});
