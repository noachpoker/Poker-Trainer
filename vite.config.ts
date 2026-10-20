import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base './' keeps the build working from any folder or subpath.
export default defineConfig({
  base: './',
  plugins: [react()],
});
