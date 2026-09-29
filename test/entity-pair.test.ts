import { describe, expect, it } from "vitest";

import { computePairName, findEntityPair, stubConfig } from "../src/entity-pair";
import type { HomeAssistant } from "../src/home-assistant";
import { createEntity, createHass } from "./fake_data/hass";

const hassWith = (...entityIds: string[]) => createHass(entityIds.map((entityId) => createEntity(entityId, "1")));

describe("findEntityPair", () => {
	it("finds the other entity from either side", () => {
		const hass = hassWith("input_number.heating_low", "input_number.heating_high");
		const pair = { entity_low: "input_number.heating_low", entity_high: "input_number.heating_high" };
		expect(findEntityPair(hass, "input_number.heating_low")).toEqual(pair);
		expect(findEntityPair(hass, "input_number.heating_high")).toEqual(pair);
	});

	it.each([
		["number.price_min", "number.price_max"],
		["input_number.pris_min", "input_number.pris_maks"],
		["input_number.temp_lav", "input_number.temp_hoj"],
		["input_number.heizung_niedrig", "input_number.heizung_hoch"],
		["input_number.precio_minimo", "input_number.precio_maximo"],
		["time.pump_start", "time.pump_end"],
		["input_datetime.ferie_fra", "input_datetime.ferie_til"],
		["date.urlaub_von", "date.urlaub_bis"],
		["datetime.carga_inicio", "datetime.carga_fin"],
	])("finds %s and %s", (entityLow, entityHigh) => {
		expect(findEntityPair(hassWith(entityLow, entityHigh), entityLow)).toEqual({
			entity_low: entityLow,
			entity_high: entityHigh,
		});
	});

	it("matches whole words only", () => {
		const hass = hassWith("input_number.lowland", "input_number.highland");
		expect(findEntityPair(hass, "input_number.lowland")).toBeNull();
	});

	it("needs the other entity to exist in the same domain", () => {
		expect(findEntityPair(hassWith("input_number.heating_low"), "input_number.heating_low")).toBeNull();
		expect(findEntityPair(hassWith("input_number.a_low", "number.a_high"), "input_number.a_low")).toBeNull();
	});

	it("ignores domains the card does not support", () => {
		expect(findEntityPair(hassWith("sensor.a_low", "sensor.a_high"), "sensor.a_low")).toBeNull();
	});
});

describe("stubConfig", () => {
	it("prefers a pair on the current view", () => {
		const hass = hassWith("input_number.a_low", "input_number.a_high", "input_number.b_low", "input_number.b_high");
		expect(stubConfig(hass, ["input_number.b_high"])).toEqual({
			entity_low: "input_number.b_low",
			entity_high: "input_number.b_high",
		});
	});

	it("takes two numbers when there is no pair", () => {
		const hass = hassWith("sensor.x", "time.start", "input_number.one", "number.two");
		expect(stubConfig(hass)).toEqual({ entity_low: "input_number.one", entity_high: "number.two" });
	});

	it("leaves the entities empty when there are none", () => {
		expect(stubConfig(hassWith("sensor.x"))).toEqual({ entity_low: "", entity_high: "" });
	});
});

describe("computePairName", () => {
	const nameOf = (lowName: string, highName: string) => {
		const lower = createEntity("input_number.a", "1", { friendly_name: lowName });
		const upper = createEntity("input_number.b", "1", { friendly_name: highName });
		return computePairName(createHass([lower, upper]) as HomeAssistant, lower, upper);
	};

	it("gives the words at the start both names share", () => {
		expect(nameOf("Heating low", "Heating high")).toBe("Heating");
		expect(nameOf("Living room heating min", "Living room heating max")).toBe("Living room heating");
	});

	it("gives the words at the end both names share", () => {
		expect(nameOf("Min price", "Max price")).toBe("Price");
	});

	it("gives the lower name when the names share nothing", () => {
		expect(nameOf("Start", "End")).toBe("Start");
	});
});
