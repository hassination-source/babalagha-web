import { defineConfig } from "@playwright/test";

/**
 * End-to-end tests against a running app with a seeded database.
 *   npm run db:seed && ADMIN_EMAIL=... ADMIN_PASSWORD=... npm run admin:create
 *   E2E_ADMIN_EMAIL=... E2E_ADMIN_PASSWORD=... npm run test:e2e
 */
export default defineConfig({
  testDir: "tests/e2e",
  timeout: 60_000,
  fullyParallel: false,
  workers: 1,
  use: { baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3000", trace: "retain-on-failure" },
  projects: [
    { name: "desktop", use: { viewport: { width: 1366, height: 900 } } },
    { name: "mobile", use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }, grep: /@mobile/ },
  ],
});
