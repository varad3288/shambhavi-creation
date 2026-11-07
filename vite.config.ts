import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ command }) => {
  const isVercel = Boolean(process.env.VERCEL);
  return {
    base: isVercel ? '/' : (process.env.VITE_BASE || (command === 'build' ? '/shambhavi-creation/' : '/')),
    plugins: [
      react(),
      tailwindcss(),
    ],
    server: {
      port: 5180,
      host: true,
    },
  };
})
