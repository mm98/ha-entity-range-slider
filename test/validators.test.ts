import { describe, expect, it } from "vitest";

import { validateConfig, validateEditorConfig } from "../src/validators";

const pair = { type: "custom:entity-range-slider", entity_low: "input_number.low", entity_high: "input_number.high" };

describe("validateEditorConfig", () => {
	it("accepts a config without entities", () => {
		expect(() => validateEditorConfig({ type: "custom:entity-range-slider" })).not.toThrow();
	});

	it("rejects a config that is not a map", () => {
		for (const config of [undefined, null, "text", 5]) {
			expect(() => validateEditorConfig(config)).toThrow("The settings must be a map.");
		}
	});

	it.each(["entity_low", "entity_high", "icon", "unit"])("rejects %s that is not text", (key) => {
		expect(() => validateEditorConfig({ ...pair, [key]: 5 })).toThrow(`${key} must be text.`);
	});

	it.each(["min", "max", "step"])("accepts %s as a number or text, and nothing else", (key) => {
		expect(() => validateEditorConfig({ ...pair, [key]: 5 })).not.toThrow();
		expect(() => validateEditorConfig({ ...pair, [key]: "06:00" })).not.toThrow();
		expect(() => validateEditorConfig({ ...pair, [key]: true })).toThrow(`${key} must be a number, a date or a time.`);
	});

	it("accepts every show option and rejects others", () => {
		for (const show of ["both", "low", "high", "none"]) {
			expect(() => validateEditorConfig({ ...pair, show })).not.toThrow();
		}
		expect(() => validateEditorConfig({ ...pair, show: "lower" })).toThrow("show must be one of: both, low, high, none.");
	});

	it("accepts every position and rejects others", () => {
		for (const position of ["inline", "below"]) {
			expect(() => validateEditorConfig({ ...pair, position })).not.toThrow();
		}
		expect(() => validateEditorConfig({ ...pair, position: "right" })).toThrow("position must be one of: inline, below.");
	});

	it.each(["full_width", "push", "small"])("accepts %s as true or false only", (key) => {
		expect(() => validateEditorConfig({ ...pair, [key]: true })).not.toThrow();
		expect(() => validateEditorConfig({ ...pair, [key]: false })).not.toThrow();
		expect(() => validateEditorConfig({ ...pair, [key]: "yes" })).toThrow(`${key} must be true or false.`);
	});

	it("treats emptied fields as not set", () => {
		expect(() =>
			validateEditorConfig({ ...pair, icon: "", min: "", show: null, position: undefined, small: "" }),
		).not.toThrow();
	});

	it("never rejects Home Assistant's own keys", () => {
		expect(() =>
			validateEditorConfig({
				...pair,
				view_layout: { position: "main" },
				layout_options: {},
				grid_options: { columns: 12 },
				visibility: [],
				disabled: true,
			}),
		).not.toThrow();
	});
});

describe("validateConfig", () => {
	it("accepts two entities of the same kind", () => {
		expect(() => validateConfig(pair)).not.toThrow();
		expect(() => validateConfig({ ...pair, entity_high: "number.high" })).not.toThrow();
		expect(() => validateConfig({ ...pair, entity_low: "time.start", entity_high: "input_datetime.end" })).not.toThrow();
		expect(() => validateConfig({ ...pair, entity_low: "date.from", entity_high: "date.to" })).not.toThrow();
		expect(() => validateConfig({ ...pair, entity_low: "datetime.start", entity_high: "datetime.end" })).not.toThrow();
	});

	it("needs both entities", () => {
		expect(() => validateConfig({ ...pair, entity_low: undefined })).toThrow("Set both entity_low and entity_high.");
		expect(() => validateConfig({ ...pair, entity_high: "" })).toThrow("Set both entity_low and entity_high.");
	});

	it("rejects the old key names", () => {
		expect(() =>
			validateConfig({ type: pair.type, entity_min: pair.entity_low, entity_max: pair.entity_high }),
		).toThrow("Set both entity_low and entity_high.");
	});

	it("needs two different entities", () => {
		expect(() => validateConfig({ ...pair, entity_high: pair.entity_low })).toThrow(
			"entity_low and entity_high must be two different entities.",
		);
	});

	it("rejects domains the card does not support", () => {
		expect(() => validateConfig({ ...pair, entity_low: "sensor.low" })).toThrow(
			"entity_low must be one of these entity types: input_number, number, input_datetime, time, date, datetime.",
		);
		expect(() => validateConfig({ ...pair, entity_high: "light.kitchen" })).toThrow("entity_high must be one of");
	});

	it("rejects two kinds of values", () => {
		expect(() => validateConfig({ ...pair, entity_high: "time.end" })).toThrow(
			"entity_low and entity_high must hold the same kind of value",
		);
		expect(() => validateConfig({ ...pair, entity_low: "date.from", entity_high: "time.end" })).toThrow(
			"entity_low and entity_high must hold the same kind of value",
		);
	});

	it("needs a step above 0", () => {
		expect(() => validateConfig({ ...pair, step: 0.5 })).not.toThrow();
		expect(() => validateConfig({ ...pair, step: "2" })).not.toThrow();
		for (const step of [0, -1, "abc"]) {
			expect(() => validateConfig({ ...pair, step })).toThrow("step must be a number above 0.");
		}
	});

	it("checks number limits", () => {
		expect(() => validateConfig({ ...pair, min: 10, max: "30" })).not.toThrow();
		expect(() => validateConfig({ ...pair, min: "abc" })).toThrow("min must be a number.");
		expect(() => validateConfig({ ...pair, max: "06:00" })).toThrow("max must be a number.");
		expect(() => validateConfig({ ...pair, min: 30, max: 10 })).toThrow("min must be below max.");
		expect(() => validateConfig({ ...pair, min: 10, max: 10 })).toThrow("min must be below max.");
	});

	it("leaves the limits of an input_datetime pair to the state", () => {
		// An input_datetime can hold a time, a date or both, so the limits are
		// only checked once the states are known.
		expect(() =>
			validateConfig({ ...pair, entity_low: "input_datetime.from", entity_high: "input_datetime.to", min: "06:00" }),
		).not.toThrow();
	});
});
