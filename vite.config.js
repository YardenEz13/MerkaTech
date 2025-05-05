import path from "path"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from "vite"
 
export default defineConfig({
  server: {
    port: 3030,
  },

  plugins: [
    react(), 
    tailwindcss()
  ],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // remove all your manual react/react-dom/jsx-runtime aliases:
      // "react": …
      // "react-dom": …
      // "react/jsx-runtime": …
    },
    // ensure Rollup prefers the “browser” and “module” fields first
    mainFields: ["browser", "module", "main"],
  },

  define: {
    "process.env": {}
  },

  

  build: {
   // commonjsOptions: {
     // include: [/@tensorflow\/tfjs/, /@teachablemachine\/image/],
    //},
  },
})
