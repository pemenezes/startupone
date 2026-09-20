import test from 'node:test';
import assert from 'node:assert/strict';
import { composeCompanyPresentation, presentationAdminRoute } from '../src/data/companyPresentationBridge.js';
import { reducePresentationJourney } from '../src/lib/presentationMobility.js';

const initial = { arrivedStops: [], statuses: {}, started: false, completed: false };

test('admin route follows the shared journey and passenger decisions', () => {
  const planned = presentationAdminRoute(initial);
  assert.equal(planned.id, 'CF-01');
  assert.equal(planned.name, 'Centro → Campus Comfy');
  assert.equal(planned.status, 'planned');
  assert.equal(planned.nextStop, 'Praça da República');

  let journey = reducePresentationJourney(initial, { type: 'start' });
  journey = reducePresentationJourney(journey, { type: 'arrive', stopId: 'centro' });
  journey = reducePresentationJourney(journey, { type: 'attendance', passengerId: 'ana', status: 'boarded' });
  journey = reducePresentationJourney(journey, { type: 'attendance', passengerId: 'bruno', status: 'absent' });
  const running = presentationAdminRoute(journey);
  assert.equal(running.status, 'in_progress');
  assert.equal(running.progress, 25);
  assert.equal(running.passengers[0].status, 'boarded');
  assert.equal(running.passengers[1].status, 'absent');
  assert.equal(running.todayAbsences, 1);
  assert.deepEqual(running.position, [-23.5431, -46.6427]);
  assert.equal(composeCompanyPresentation({ routes: [], employees: [], occurrences: [] }, journey).routes[0].history.length, 30);

  const completed = presentationAdminRoute({
    ...initial, started: true, completed: true, arrivedStops: ['centro', 'roosevelt', 'paulista', 'campus'],
  });
  assert.equal(completed.status, 'completed');
  assert.equal(completed.progress, 100);
  assert.equal(completed.nextStop, 'Destino concluído');
});

test('admin keeps other routes and adds the current journey without duplicating employees', () => {
  const data = composeCompanyPresentation({
    company: { name: 'TechCorp' },
    routes: [{ id: 'RT-42', name: 'Outra rota' }, { id: 'LIVE-01', name: 'Rota cadastrada' }],
    employees: [{ id: 'E101', name: 'Duplicado' }, { id: 'LIVE-E1', name: 'Colaborador cadastrado' }],
    occurrences: [],
  }, { ...initial, started: true, arrivedStops: ['centro'], statuses: { ana: 'absent' } });
  assert.equal(data.routes[0].id, 'CF-01');
  assert.equal(data.routes.filter((route) => route.id === 'RT-42').length, 1);
  assert.ok(data.routes.some((route) => route.id === 'LIVE-01'));
  assert.equal(data.employees.filter((person) => person.id === 'E101').length, 1);
  assert.ok(data.occurrences.some((item) => item.id === 'CF-01:absence-today'));
});
