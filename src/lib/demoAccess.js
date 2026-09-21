const STORAGE_KEY = 'comfy:demo-role:v1';

export const DEMO_PROFILES = {
  employee: {
    id: 'demo-employee', email: 'funcionario@movecorp.test', full_name: 'Ana Silva',
    role: 'employee', company_id: 'demo-company', region_id: 'demo-centro',
    home_address: 'Praça da República, São Paulo', work_address: 'Campus Comfy, São Paulo',
    credit_balance: 350, no_show_count: 0,
  },
  driver: {
    id: 'demo-driver', email: 'motorista@movecorp.test', full_name: 'Carlos Roberto',
    role: 'driver', company_id: 'demo-company', region_id: 'demo-centro',
  },
  admin: {
    id: 'demo-admin', email: 'admin@movecorp.test', full_name: 'Mariana Costa',
    role: 'admin', company_id: 'demo-company', region_id: 'demo-centro',
  },
};

export const isDemoId = (id) => typeof id === 'string' && id.startsWith('demo-');

export function readDemoRole() {
  try {
    const role = window.sessionStorage.getItem(STORAGE_KEY);
    return Object.hasOwn(DEMO_PROFILES, role) ? role : null;
  } catch { return null; }
}

export function writeDemoRole(role) {
  if (!Object.hasOwn(DEMO_PROFILES, role)) throw new Error('Perfil de acesso inválido.');
  try { window.sessionStorage.setItem(STORAGE_KEY, role); } catch { /* In-memory access still works. */ }
}

export function clearDemoRole() {
  try { window.sessionStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
}

export function demoSession(role) {
  const profile = DEMO_PROFILES[role];
  return profile ? { user: { id: profile.id, email: profile.email } } : null;
}

export function resetDemoPreferences() {
  const keys = [
    'comfy:employee-route:demo-employee',
    'movecorp:notification-prefs:demo-employee',
    'comfy:driver-notifications:demo-driver',
    'comfy:driver-region:demo-driver',
    'comfy:notification-read:demo-employee-route',
    'comfy:notification-read:demo-employee-credit',
    'comfy:notification-read:demo-driver-route',
  ];
  try { keys.forEach((key) => window.localStorage.removeItem(key)); } catch { /* ignore */ }
  window.dispatchEvent(new Event('comfy:employee-route-change'));
}
