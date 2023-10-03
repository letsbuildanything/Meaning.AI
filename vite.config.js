import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import manifest from './public/manifest.json'
import { crx } from "@crxjs/vite-plugin";


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(),
    crx({manifest})
  ]
})
