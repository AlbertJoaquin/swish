// astro.config.mjs
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';

export default defineConfig({
  // output: 'server' -- remove this line
  vite: {
    plugins: [tailwindcss()]
  },
  integrations: [react()]
});