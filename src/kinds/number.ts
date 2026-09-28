// Numbers: input_number and number entities.

import { isSet } from "../config";
import { computeDomain, type FrontendLocaleData, type HassEntity, type HomeAssistant } from "../home-assistant";
import type { ValueKind } from "./value-kind";

const NUMBER_DOMAINS = ["input_number", "number"];

const decimalsOf = (number: number | string): number => (String(number).split(".")[1] ?? "").length;

// src/common/number/format_number.ts
const numberFormatToLocale = (localeOptions: FrontendLocaleData): string | string[] | undefined => {
	switch (localeOptions.number_format) {
		case "comma_decimal":
			return ["en-US", "en"];
		case "decimal_comma":
			return ["de", "es", "it"];
		case "space_comma":
			return ["fr", "sv", "cs"];
		case "quote_decimal":
			return ["de-CH"];
		case "system":
			return undefined;
		default:
			return localeOptions.language;
	}
};

// Formats a value the way Home Assistant formats a number entity's state, but
// with at least the decimals of the step, so both values match.
const formatNumberState = (hass: HomeAssistant, stateObj: HassEntity, step: number): string => {
	const value = Number(stateObj.state);
	const precision = hass.entities[stateObj.entity_id]?.display_precision;
	let decimals: number;
	if (precision != null) {
		decimals = precision;
	} else if (Number.isInteger(step) && Number.isInteger(value)) {
		decimals = 0;
	} else {
		decimals = Math.max(decimalsOf(stateObj.state), decimalsOf(step));
	}
	// Like formatNumberToParts in src/common/number/format_number.ts, the
	// number format "none" uses en-US without grouping.
	const none = hass.locale.number_format === "none";
	return new Intl.NumberFormat(none ? "en-US" : numberFormatToLocale(hass.locale), {
		minimumFractionDigits: decimals,
		maximumFractionDigits: decimals,
		useGrouping: !none,
	}).format(value);
};

// src/common/translations/blank_before_unit.ts, with blankBeforePercent from
// src/common/translations/blank_before_percent.ts
const blankBeforeUnit = (unit: string, localeOptions: FrontendLocaleData): string => {
	if (unit === "°") {
		return "";
	}
	if (unit === "%") {
		return ["cs", "de", "fi", "fr", "sk", "sv"].includes(localeOptions.language) ? " " : "";
	}
	return " ";
};

const withUnit = (text: string, unit: string, localeOptions: FrontendLocaleData): string =>
	unit ? `${text}${blankBeforeUnit(unit, localeOptions)}${unit}` : text;

export const numberKind: ValueKind = {
	id: "number",
	domains: NUMBER_DOMAINS,
	// Like Home Assistant's number slider.
	position: "inline",

	holds: (stateObj) => NUMBER_DOMAINS.includes(computeDomain(stateObj.entity_id)),

	validateConfig(config) {
		for (const key of ["min", "max"] as const) {
			if (isSet(config[key]) && !Number.isFinite(Number(config[key]))) {
				throw new Error(`${key} must be a number.`);
			}
		}
		if (isSet(config.min) && isSet(config.max) && Number(config.min) >= Number(config.max)) {
			throw new Error("min must be below max.");
		}
	},

	range: (config, lower, upper) => ({
		min: Number(isSet(config.min) ? config.min : (lower.attributes.min ?? 0)),
		max: Number(isSet(config.max) ? config.max : (upper.attributes.max ?? 100)),
		step: Number(isSet(config.step) ? config.step : (lower.attributes.step ?? upper.attributes.step ?? 1)),
		unit: isSet(config.unit)
			? String(config.unit)
			: lower.attributes.unit_of_measurement || upper.attributes.unit_of_measurement || "",
	}),

	defaults: (lower, upper) => {
		const text = (value: unknown) => (isSet(value) ? String(value) : undefined);
		return {
			min: text(lower?.attributes.min),
			max: text(upper?.attributes.max),
			step: text(lower?.attributes.step ?? upper?.attributes.step),
			unit: text(lower?.attributes.unit_of_measurement || upper?.attributes.unit_of_measurement),
		};
	},

	value: (stateObj) => Number(stateObj.state),

	round: (value, range) => Number(value.toFixed(Math.max(decimalsOf(range.step), decimalsOf(range.min)))),

	// Two numbers share one unit: "18.0 - 22.0 °C".
	format: (stateObjs, range, hass) =>
		withUnit(
			stateObjs.map((stateObj) => formatNumberState(hass, stateObj, range.step)).join(" - "),
			range.unit,
			hass.locale,
		),

	save: (hass, entityId, value) =>
		hass.callService(computeDomain(entityId), "set_value", { value }, { entity_id: entityId }),
};
