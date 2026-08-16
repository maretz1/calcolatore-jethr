import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base: path del sito su GitHub Pages (https://<utente>.github.io/calcolatore-jethr/).
// In sviluppo Vite serve comunque da '/', quindi non serve differenziare gli ambienti.
export default defineConfig({
  base: '/calcolatore-jethr/',
  plugins: [react()],
})
