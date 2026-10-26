import '@testing-library/jest-dom';

// jsdom has no ResizeObserver. Recharts' ResponsiveContainer needs one, so use a no-op stand-in in tests.
// It is set directly (not with vi.stubGlobal) so vi.unstubAllGlobals() in tests does not remove it.
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver = ResizeObserverStub as unknown as typeof ResizeObserver;
