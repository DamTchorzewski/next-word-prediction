import tailwindcss from "@tailwindcss/vite";
import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vitest/config";

// The app lives in web/; GitHub Pages serves it under /next-word-prediction/.
export default defineConfig({
  root: "web",
  base: "/next-word-prediction/",
  plugins: [vue(), tailwindcss()],
  build: {
    outDir: "../dist",
    emptyOutDir: true,
    target: "es2022",
  },
  // onnxruntime-web ships its own worker-free wasm bundle; let it load the .wasm itself
  optimizeDeps: { exclude: ["onnxruntime-web"] },
  test: {
    root: ".",
    include: ["web/src/**/*.test.ts"],
    environment: "node",
  },
});
