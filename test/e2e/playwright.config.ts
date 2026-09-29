import { fileURLToPath } from "node:url";

import { defineConfig, devices } from "@playwright/test";

const PORT = 8120;
const BASE_URL = `http://localhost:${PORT}`;

export default defineConfig({
	testDir: ".",
	testMatch: "*.spec.ts",

	timeout: 30_000,
	expect: { timeout: 5_000 },

	retries: process.env.CI ? 1 : 0,
	fullyParallel: true,
	forbidOnly: Boolean(process.env.CI),

	outputDir: "test-results",
	reporter: process.env.CI ? [["list"], ["github"]] : [["list"]],

	use: {
		baseURL: BASE_URL,
		trace: "on-first-retry",
		screenshot: "only-on-failure",
	},

	projects: [
		{
			name: "chromium",
			use: { ...devices["Desktop Chrome"] },
		},
		{
			name: "mobile-chrome",
			use: { ...devices["Pixel 7"] },
		},
	],

	webServer: {
		command: "npm run build && node test/e2e/serve.mjs",
		url: BASE_URL,
		reuseExistingServer: !process.env.CI,
		timeout: 60_000,
		cwd: fileURLToPath(new URL("../..", import.meta.url)),
		env: { PORT: String(PORT) },
		stdout: "pipe",
		stderr: "pipe",
	},
});
