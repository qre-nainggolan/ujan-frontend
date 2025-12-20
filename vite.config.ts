import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig(() => {
  return {
    optimizeDeps: {
      include: ["lodash", "axios"],
      exclude: ["fsevents"],
    },
    build: {
      chunkSizeWarningLimit: 1000,
      target: "esnext",
      outDir: "../wwwroot",
    },
    define: {
      "process.env": process.env, // ✅ exposes env to browser-side code
    },
    server: {
      port: 3001,
      hmr: {
        overlay: false, // avoids heavy error screen & reduces memory spikes
      },
    },
    plugins: [react()],
  };
});
