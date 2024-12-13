import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [sveltekit()],
  optimizeDeps: {
    include: ['monaco-editor'],
  },
  server: {
    host: '0.0.0.0',  // Binds to all network interfaces to expose the app
    port: 5173,        // Ensure this matches the port exposed in docker-compose
  },
});
