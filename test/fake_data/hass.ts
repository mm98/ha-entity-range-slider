// A fake Home Assistant for the unit tests. It holds only what the card uses.

import type { FrontendLocaleData, HassEntity, HomeAssistant } from "../../src/home-assistant";

export const createEntity = (entityId: string, state: string, attributes: HassEntity["attributes"] = {}): HassEntity => ({
	entity_id: entityId,
	state,
	attributes,
	last_changed: "2026-10-01T00:00:00+00:00",
	last_updated: "2026-10-01T00:00:00+00:00",
});

// An input_number with the attributes Home Assistant gives it.
export const createNumber = (entityId: string, state: string, attributes: HassEntity["attributes"] = {}): HassEntity =>
	createEntity(entityId, state, { min: 0, max: 30, step: 0.5, unit_of_measurement: "°C", ...attributes });

export interface ServiceCall {
	domain: string;
	service: string;
	data?: Record<string, unknown>;
	entityId?: string | string[];
}

export interface FakeHass extends HomeAssistant {
	calls: ServiceCall[];
}

export const createHass = (
	entities: HassEntity[] = [],
	{
		locale = {},
		timeZone = "Europe/Copenhagen",
		displayPrecision = {},
	}: {
		locale?: Partial<FrontendLocaleData>;
		timeZone?: string;
		displayPrecision?: Record<string, number>;
	} = {},
): FakeHass => {
	const calls: ServiceCall[] = [];
	return {
		calls,
		states: Object.fromEntries(entities.map((stateObj) => [stateObj.entity_id, stateObj])),
		entities: Object.fromEntries(
			Object.entries(displayPrecision).map(([entityId, precision]) => [
				entityId,
				{ entity_id: entityId, display_precision: precision },
			]),
		),
		config: { time_zone: timeZone, state: "RUNNING" },
		locale: { language: "en", number_format: "language", time_format: "language", time_zone: "server", ...locale },
		language: locale.language ?? "en",
		connected: true,
		themes: {},
		localize: (key, values) => `${key}${values ? ` ${JSON.stringify(values)}` : ""}`,
		formatEntityState: (stateObj) => `state:${stateObj.state}`,
		formatEntityAttributeName: (_stateObj, attribute) => attribute,
		formatEntityAttributeValue: (_stateObj, _attribute, value) => String(value),
		formatEntityName: (stateObj) => String(stateObj.attributes.friendly_name ?? ""),
		callService: async (domain, service, data, target) => {
			calls.push({ domain, service, data, entityId: target?.entity_id });
		},
	};
};
