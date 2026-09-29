import { readdirSync, readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import en from "../../src/i18n/en.json";
import es from "../../src/i18n/es.json";
import { hasTranslation, languageOf, translate } from "../../src/i18n";
import { createHass } from "../fake_data/hass";

// Every language file in src/i18n, also one that is not added to the card yet.
const I18N_DIR = new URL("../../src/i18n/", import.meta.url);
const LANGUAGES = readdirSync(I18N_DIR)
	.filter((file) => file.endsWith(".json"))
	.map((file) => [file.replace(".json", ""), JSON.parse(readFileSync(new URL(file, I18N_DIR), "utf-8"))] as const);

// Every key of a translation, like "label.min".
const keysOf = (translation: object, prefix = ""): string[] =>
	Object.entries(translation).flatMap(([key, value]) =>
		typeof value === "object" ? keysOf(value, `${prefix}${key}.`) : [`${prefix}${key}`],
	);

describe("translations", () => {
	it.each(LANGUAGES)("%s has every text of en.json and no others", (_language, translation) => {
		expect(keysOf(translation).sort()).toEqual(keysOf(en).sort());
	});

	it.each(LANGUAGES)("%s has no empty texts", (language) => {
		const empty = keysOf(en).filter((key) => !translate(key as never, language).trim());
		expect(empty).toEqual([]);
	});

	it("uses every language file", () => {
		for (const [language, translation] of LANGUAGES) {
			expect(translate("label.min", language)).toBe(translation.label.min);
		}
	});
});

describe("translate", () => {
	it("uses the language of a regional variant", () => {
		expect(translate("label.step", "es-419")).toBe(es.label.step);
	});

	it("falls back to English", () => {
		expect(translate("label.step", "fr")).toBe(en.label.step);
	});
});

describe("hasTranslation", () => {
	it("knows the keys of en.json", () => {
		expect(hasTranslation("label.min")).toBe(true);
		expect(hasTranslation("label.name")).toBe(false);
		expect(hasTranslation("label")).toBe(false);
	});
});

describe("languageOf", () => {
	it("follows the language of the user profile", () => {
		const hass = createHass([], { locale: { language: "de" } });
		expect(languageOf({ ...hass, language: "en" })).toBe("de");
	});
});
