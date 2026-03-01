import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const isGitHubActions = process.env.GITHUB_ACTIONS === 'true'
// VITE_BASE_PATH 在 Docker 生产构建时传入（如 /aire/），本地开发默认 /
const base = process.env.VITE_BASE_PATH || (isGitHubActions ? '/takeoff-aviation/' : '/')

export default defineConfig({
  plugins: [react()],
  base,
})
