import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

export default defineConfig({
    plugins: [react(), tailwindcss()],
    resolve: {
        dedupe: ['react', 'react-dom'],
        alias: {
            '@rentnerkev/tooltips': fileURLToPath(
                new URL('../src/index.ts', import.meta.url),
            ),
        },
    },
})
