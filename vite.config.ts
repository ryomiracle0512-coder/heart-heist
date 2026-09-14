import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
export default defineConfig({base:'./',plugins:[react()],test:{include:['src/tests/**/*.test.ts']},build:{chunkSizeWarningLimit:1800}});
