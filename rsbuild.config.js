import { defineConfig, loadEnv } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';

const { publicVars } = loadEnv({ prefixes: ['VITE_'] });
const base = process.env.GITHUB_ACTIONS ? '/devMarket' : '/';

export default defineConfig({
  plugins: [pluginReact()],
  source: {
    entry: {
      index: './src/main.jsx',
    },
    define: publicVars,
  },
  html: {
    template: './index.html',
  },
  server: {
    base,
    port: 5173,
    proxy: {
      '/api': 'http://127.0.0.1:3100',
    },
  },
});
