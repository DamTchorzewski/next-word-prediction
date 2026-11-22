import { defineConfig, devices } from "@playwright/test";

// e2e against the production build (`pnpm build` first): the real models, onnxruntime-web and the base path.
export default defineConfig({
  testDir: "tests/e2e",
  timeout: 60_000,
  fullyParallel: true,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: "http://localhost:4319/next-word-prediction/",
    trace: "retain-on-failure",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    command: "pnpm preview --port 4319 --strictPort",
    url: "http://localhost:4319/next-word-prediction/",
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
