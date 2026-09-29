import { describe, expect, it } from "vitest";

import type { EntityRangeSliderConfig } from "../src/config";
import { translate } from "../src/i18n";
import { computeSliderModel, formatValues, type SliderModel } from "../src/slider-model";
import { createEntity, createHass, createNumber } from "./fake_data/hass";

const config: EntityRangeSliderConfig = {
	type: "custom:entity-range-slider",
	entity_low: "input_number.low",
	entity_high: "input_number.high",
};
const low = createNumber("input_number.low", "18.0");
const high = createNumber("input_number.high", "22.0");

const modelOf = (result: ReturnType<typeof computeSliderModel>): SliderModel => {
	if (!result.model) {
		throw new Error(`No model: ${result.warning}`);
	}
	return result.model;
};

describe("computeSliderModel", () => {
	it("gives the two values and the range", () => {
		const model = modelOf(computeSliderModel(config, createHass([low, high])));
		expect(model.kind.id).toBe("number");
		expect(model.values).toEqual([18, 22]);
		expect(model.range).toEqual({ min: 0, max: 30, step: 0.5, unit: "°C" });
		expect(model.disabled).toBe(false);
	});

	it("warns about a missing entity, like Home Assistant", () => {
		const result = computeSliderModel(config, createHass([low]));
		expect(result.warning).toBe('ui.panel.lovelace.warning.entity_not_found {"entity":"input_number.high"}');
	});

	it("says Home Assistant is starting instead while it starts", () => {
		const hass = createHass([low]);
		hass.config = { ...hass.config, state: "NOT_RUNNING" };
		expect(computeSliderModel(config, hass).warning).toBe("ui.panel.lovelace.warning.starting");
	});

	it("warns when the entities hold different kinds of values", () => {
		const time = createEntity("input_datetime.low", "06:00:00", { has_date: false, has_time: true });
		const date = createEntity("input_datetime.high", "2026-10-01", { has_date: true, has_time: false });
		const result = computeSliderModel(
			{ ...config, entity_low: time.entity_id, entity_high: date.entity_id },
			createHass([time, date]),
		);
		expect(result.warning).toBe(translate("warning.mixed_kinds", "en"));
	});

	it("warns about a limit it cannot read", () => {
		const from = createEntity("date.from", "2026-10-01");
		const to = createEntity("date.to", "2026-10-05");
		const result = computeSliderModel(
			{ ...config, entity_low: from.entity_id, entity_high: to.entity_id, max: "next week" },
			createHass([from, to]),
		);
		expect(result.warning).toBe(translate("warning.bad_limit", "en"));
	});

	it("warns when the lowest value is not below the highest", () => {
		const lower = createNumber("input_number.low", "18", { min: 40 });
		const result = computeSliderModel(config, createHass([lower, high]));
		expect(result.warning).toBe(translate("warning.bad_range", "en"));
	});

	it("warns in the language of the user profile", () => {
		const lower = createNumber("input_number.low", "18", { min: 40 });
		const result = computeSliderModel(config, createHass([lower, high], { locale: { language: "de" } }));
		expect(result.warning).toBe(translate("warning.bad_range", "de"));
	});

	it.each(["unavailable", "unknown", "not a number"])("disables the slider when an entity is %s", (state) => {
		const model = modelOf(computeSliderModel(config, createHass([createNumber("input_number.low", state), high])));
		expect(model.disabled).toBe(true);
	});

	describe("where the values show", () => {
		const hass = createHass([low, high]);
		const positionOf = (extra: Partial<EntityRangeSliderConfig>) =>
			modelOf(computeSliderModel({ ...config, ...extra }, hass)).position;

		it("follows the config", () => {
			expect(positionOf({ position: "below" })).toBe("below");
			expect(positionOf({ position: "inline" })).toBe("inline");
		});

		it("follows the kind of value when the config does not say", () => {
			expect(positionOf({})).toBe("inline");
			const start = createEntity("time.start", "06:00:00");
			const end = createEntity("time.end", "22:00:00");
			const model = modelOf(
				computeSliderModel({ ...config, entity_low: "time.start", entity_high: "time.end" }, createHass([start, end])),
			);
			expect(model.position).toBe("below");
		});

		it("is always below a full width slider", () => {
			expect(positionOf({ full_width: true })).toBe("below");
			expect(positionOf({ full_width: true, position: "inline" })).toBe("below");
			expect(positionOf({ full_width: false, position: "inline" })).toBe("inline");
		});
	});
});

describe("formatValues", () => {
	const hass = createHass([low, high]);
	const model = modelOf(computeSliderModel(config, hass));

	it("formats the values with the kind", () => {
		expect(formatValues(model, [low, high], hass)).toBe("18.0 - 22.0 °C");
		expect(formatValues(model, [high], hass)).toBe("22.0 °C");
	});

	it("gives nothing when no value shows", () => {
		expect(formatValues(model, [], hass)).toBe("");
	});

	it("gives the state of an entity without a value, like Home Assistant", () => {
		const unavailable = createNumber("input_number.low", "unavailable");
		expect(formatValues(model, [unavailable, high], hass)).toBe("state:unavailable");
	});
});
