import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  // Consumers already ship these; keep them out of our bundle so there is
  // a single copy of React / wagmi / viem at runtime.
  external: ['react', 'react-dom', 'wagmi', 'viem', '@tanstack/react-query'],
})
