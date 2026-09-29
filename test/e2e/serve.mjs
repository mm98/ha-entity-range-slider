// Builds the test page and serves it, for the end-to-end tests.
// Run npm run build first, the page loads the card from dist/.

import { fileURLToPath } from "node:url";

import * as esbuild from "esbuild";

const PORT = Number(process.env.PORT ?? 8120);
const pageDir = fileURLToPath(new URL("./page/", import.meta.url));

const context = await esbuild.context({
	entryPoints: [`${pageDir}page.js`],
	bundle: true,
	format: "esm",
	target: "es2022",
	outdir: `${pageDir}build`,
	logLevel: "warning",
});
await context.serve({ servedir: pageDir, port: PORT });
console.log(`Serving the test page on http://localhost:${PORT}`);
