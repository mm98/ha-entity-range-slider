// Bundles the card into the one file Home Assistant loads: dist/entity-range-slider.js.
// "node build.mjs --watch" rebuilds on every change.

import * as esbuild from "esbuild";
import { readFile } from "node:fs/promises";

const pkg = JSON.parse(await readFile(new URL("./package.json", import.meta.url), "utf8"));

const options = {
	entryPoints: ["src/entity-range-slider.ts"],
	outfile: "dist/entity-range-slider.js",
	bundle: true,
	// A plain script works both as a dashboard resource and when pasted into a page.
	format: "iife",
	target: "es2022",
	charset: "utf8",
	define: { __VERSION__: JSON.stringify(pkg.version) },
	banner: { js: `/* Entity range slider ${pkg.version}, ${pkg.homepage} */` },
	logLevel: "info",
};

if (process.argv.includes("--watch")) {
	await (await esbuild.context(options)).watch();
} else {
	await esbuild.build(options);
}
