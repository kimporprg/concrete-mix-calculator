import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Change base to '/your-repo-name/' when deploying to GitHub Pages
// e.g. base: '/concrete-mix-design/'
// Leave as '/' for Vercel or local dev
export default defineConfig({
  plugins: [react()],
  base: '/concrete-mix-calculator/',
})
