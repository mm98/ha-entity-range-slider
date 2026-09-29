import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		exclude: [...configDefaults.exclude, "test/e2e/**"],
		environment: "node",
		env: {
			TZ: "Etc/UTC",
		},
	},
});
