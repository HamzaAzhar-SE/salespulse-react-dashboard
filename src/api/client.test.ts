import { buildUrl, getJson } from './client';

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe('buildUrl', () => {
  it('uses the address from VITE_API_URL in development', () => {
    vi.stubEnv('VITE_STATIC_DATA', 'false');
    vi.stubEnv('VITE_API_URL', 'http://api.test');
    expect(buildUrl('/orders')).toBe('http://api.test/orders');
  });

  it('falls back to the local mock API when no address is set', () => {
    vi.stubEnv('VITE_STATIC_DATA', 'false');
    vi.stubEnv('VITE_API_URL', undefined);
    expect(buildUrl('/customers')).toBe('http://localhost:3001/customers');
  });

  it('reads static JSON files on the deployed site', () => {
    vi.stubEnv('VITE_STATIC_DATA', 'true');
    expect(buildUrl('/orders')).toBe('/data/orders.json');
    expect(buildUrl('/customers')).toBe('/data/customers.json');
  });
});

describe('getJson', () => {
  it('returns the parsed JSON', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve(new Response('[{"id":"a"}]', { status: 200 }))));
    await expect(getJson('/orders')).resolves.toEqual([{ id: 'a' }]);
  });

  it('explains a server error with its status code', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve(new Response('nope', { status: 500 }))));
    await expect(getJson('/orders')).rejects.toThrow('(500)');
  });

  it('explains when the API cannot be reached', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new TypeError('Failed to fetch'))));
    await expect(getJson('/orders')).rejects.toThrow('Cannot reach the API');
  });
});
