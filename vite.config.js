import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
 
export default defineConfig({
  server: {
    port: 3030,
  },
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "react": path.resolve(__dirname, "node_modules/react"),
      "react-dom": path.resolve(__dirname, "node_modules/react-dom"),
      "react/jsx-runtime": path.resolve(__dirname, "node_modules/react/jsx-runtime"),
    },
  },
  define: {
    'process.env': {}
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@tensorflow/tfjs',
      '@teachablemachine/image',
      'framer-motion',
      '@radix-ui/react-primitive',
      '@radix-ui/react-context',
      '@radix-ui/react-compose-refs',
      'lucide-react'
    ],
  },
  build: {
    commonjsOptions: {
      include: [/@tensorflow\/tfjs/, /@teachablemachine\/image/],
    },
  },
})