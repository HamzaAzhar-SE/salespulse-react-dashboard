import '@testing-library/jest-dom';

// jsdom has no ResizeObserver. Recharts' ResponsiveContainer needs one, so use a no-op stand-in in tests.
// It is set directly (not with vi.stubGlobal) so vi.unstubAllGlobals() in tests does not remove it.
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver = ResizeObserverStub as unknown as typeof ResizeObserver;

// Newer Node versions (25 and up) ship their own localStorage. Without a special flag it is undefined,
// and it hides the one that jsdom provides. If localStorage is not usable, use a simple in-memory copy.
function createMemoryStorage(): Storage {
  const data = new Map<string, string>();
  return {
    get length() {
      return data.size;
    },
    clear: () => data.clear(),
    getItem: (key) => data.get(key) ?? null,
    key: (index) => Array.from(data.keys())[index] ?? null,
    removeItem: (key) => {
      data.delete(key);
    },
    setItem: (key, value) => {
      data.set(key, String(value));
    },
  };
}

function localStorageWorks(): boolean {
  try {
    return typeof globalThis.localStorage?.clear === 'function';
  } catch {
    return false;
  }
}

if (!localStorageWorks()) {
  Object.defineProperty(globalThis, 'localStorage', {
    value: createMemoryStorage(),
    configurable: true,
    writable: true,
  });
}
