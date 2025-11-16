import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Add this block to explicitly configure dependency resolution
  resolve: {
    alias: {
      // Ensures all imports of 'react' and 'react-dom' resolve to the same path
      'react': 'path-to-your-react/node_modules/react',
      'react-dom': 'path-to-your-react/node_modules/react-dom',
    },
  },
})