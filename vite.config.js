import { defineConfig, transformWithEsbuild } from 'vite';
import react from '@vitejs/plugin-react';

const jsAsJsx = {
  name: 'load-js-files-as-jsx',
  enforce: 'pre',
  async transform(code, id) {
    if (!id.match(/\/src\/.*\.js$/)) return null;
    return transformWithEsbuild(code, id, {
      loader: 'jsx',
      jsx: 'automatic',
    });
  },
};

export default defineConfig(({ mode }) => ({
  plugins: [jsAsJsx, react()],
  define: {
    'process.env': JSON.stringify({
      NODE_ENV: mode === 'production' ? 'production' : 'development',
      PUBLIC_URL: '',
    }),
  },
}));
