import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig(() => {
  return {
    build: {
      outDir: "../wwwroot",
    },
    define: {
      "process.env": process.env, // ✅ exposes env to browser-side code
    },
    server: {
      port: 3001,
      hmr: true,
    },
    plugins: [react()],
  };
});
