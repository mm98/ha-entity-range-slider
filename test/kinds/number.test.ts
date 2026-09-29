import { describe, expect, it } from "vitest";

import type { EntityRangeSliderConfig } from "../../src/config";
import { numberKind } from "../../src/kinds/number";
import type { SliderRange } from "../../src/kinds";
import { createEntity, createHass, createNumber } from "../fake_data/hass";

const config: EntityRangeSliderConfig = {
	type: "custom:entity-range-slider",
	entity_low: "input_number.low",
	entity_high: "input_number.high",
};
const low = createNumber("input_number.low", "18.0");
const high = createNumber("input_number.high", "22.0");
const range: SliderRange = { min: 0, max: 30, step: 0.5, unit: "°C" };

describe("numberKind.holds", () => {
	it("holds input_number and number entities", () => {
		expect(numberKind.holds(low)).toBe(true);
		expect(numberKind.holds(createEntity("number.price", "5"))).toBe(true);
		expect(numberKind.holds(createEntity("sensor.price", "5"))).toBe(false);
	});
});

describe("numberKind.range", () => {
	const hass = createHass([low, high]);

	it("takes the lower entity's min and step and the upper entity's max and unit", () => {
		const lower = createNumber("input_number.low", "18", { min: 5, step: 0.1, unit_of_measurement: "" });
		const upper = createNumber("input_number.high", "22", { max: 40, step: 2, unit_of_measurement: "kr" });
		expect(numberKind.range(config, lower, upper, hass)).toEqual({ min: 5, max: 40, step: 0.1, unit: "kr" });
	});

	it("uses the config over the attributes", () => {
		expect(numberKind.range({ ...config, min: "10", max: 25, step: "1", unit: "%" }, low, high, hass)).toEqual({
			min: 10,
			max: 25,
			step: 1,
			unit: "%",
		});
	});

	it("treats emptied fields as not set", () => {
		expect(numberKind.range({ ...config, min: "", unit: "" }, low, high, hass)).toEqual(range);
	});
});

describe("numberKind.defaults", () => {
	it("gives the attributes as text", () => {
		expect(numberKind.defaults(low, high)).toEqual({ min: "0", max: "30", step: "0.5", unit: "°C" });
	});

	it("gives nothing without entities", () => {
		expect(numberKind.defaults()).toEqual({ min: undefined, max: undefined, step: undefined, unit: undefined });
	});
});

describe("numberKind.round", () => {
	it("rounds to the decimals of the step", () => {
		expect(numberKind.round(18.500000000001, range)).toBe(18.5);
		expect(numberKind.round(0.30000000000000004, { ...range, step: 0.1 })).toBe(0.3);
		expect(numberKind.round(7.4, { ...range, step: 1 })).toBe(7);
	});

	it("keeps the decimals of min", () => {
		expect(numberKind.round(1.25, { ...range, min: 0.25, step: 1 })).toBe(1.25);
	});
});

describe("numberKind.format", () => {
	it("gives both values with one unit", () => {
		expect(numberKind.format([low, high], range, createHass())).toBe("18.0 - 22.0 °C");
	});

	it("follows the number format of the user profile", () => {
		expect(numberKind.format([low, high], range, createHass([], { locale: { language: "da" } }))).toBe(
			"18,0 - 22,0 °C",
		);
		expect(
			numberKind.format([low], range, createHass([], { locale: { language: "en", number_format: "decimal_comma" } })),
		).toBe("18,0 °C");
	});

	it("groups thousands unless the number format is none", () => {
		const big = createNumber("number.big", "3000.0");
		expect(numberKind.format([big], range, createHass())).toBe("3,000.0 °C");
		expect(numberKind.format([big], range, createHass([], { locale: { number_format: "none" } }))).toBe("3000.0 °C");
	});

	it("shows whole numbers without decimals when the step is whole", () => {
		const whole = createEntity("number.low", "20");
		expect(numberKind.format([whole], { ...range, step: 1, unit: "" }, createHass())).toBe("20");
	});

	it("shows at least the decimals of the step", () => {
		const whole = createEntity("number.low", "20");
		expect(numberKind.format([whole], { ...range, step: 0.25, unit: "" }, createHass())).toBe("20.00");
	});

	it("uses the display precision of the entity", () => {
		const hass = createHass([], { displayPrecision: { "input_number.low": 2 } });
		expect(numberKind.format([low], range, hass)).toBe("18.00 °C");
	});

	it("puts a space before the unit like Home Assistant", () => {
		const percent = { ...range, unit: "%" };
		expect(numberKind.format([low], percent, createHass())).toBe("18.0%");
		expect(numberKind.format([low], percent, createHass([], { locale: { language: "de" } }))).toBe("18,0 %");
		expect(numberKind.format([low], { ...range, unit: "°" }, createHass())).toBe("18.0°");
	});
});

describe("numberKind.save", () => {
	it("saves with the entity's own set_value action", async () => {
		const hass = createHass();
		await numberKind.save(hass, "input_number.low", 19.5);
		await numberKind.save(hass, "number.high", 40);
		expect(hass.calls).toEqual([
			{ domain: "input_number", service: "set_value", data: { value: 19.5 }, entityId: "input_number.low" },
			{ domain: "number", service: "set_value", data: { value: 40 }, entityId: "number.high" },
		]);
	});
});

describe("numberKind.validateConfig", () => {
	it("needs numbers for the limits, with min below max", () => {
		expect(() => numberKind.validateConfig?.({ ...config, min: 5, max: "10" })).not.toThrow();
		expect(() => numberKind.validateConfig?.({ ...config, min: "today" })).toThrow("min must be a number.");
		expect(() => numberKind.validateConfig?.({ ...config, min: 10, max: 5 })).toThrow("min must be below max.");
	});
});
