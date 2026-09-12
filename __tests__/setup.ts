// Silence React Native warning noise in pure-logic test output
const originalWarn = console.warn;
console.warn = (...args: unknown[]) => {
  if (typeof args[0] === 'string' && args[0].includes('Warning:')) return;
  originalWarn(...args);
};
