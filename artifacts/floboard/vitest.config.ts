import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    // Only run the pure, dependency-free util logic tests. React Native
    // screens/components are not exercised here (they need a device runtime).
    include: ['utils/**/*.test.ts'],
  },
});
