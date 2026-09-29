// What the row shows, worked out from the config and the states alone. It
// uses no DOM, so it can be tested on its own.

import { type EntityRangeSliderConfig, isSet, type Position, type ShowOption } from "./config";
import { createEntityNotFoundWarning, type HassEntity, type HomeAssistant, UNAVAILABLE, UNKNOWN } from "./home-assistant";
import { languageOf, translate } from "./i18n";
import { kindOf, type SliderRange, type ValueKind } from "./kinds";

// States that hold no value.
const NO_VALUE_STATES: string[] = [UNAVAILABLE, UNKNOWN];

export interface SliderModel {
	kind: ValueKind;
	range: SliderRange;
	lower: HassEntity;
	upper: HassEntity;
	// The two handle values. Only valid when the slider is not disabled.
	values: [number, number];
	disabled: boolean;
	show: ShowOption;
	position: Position;
}

export type SliderModelResult = { model: SliderModel; warning?: undefined } | { warning: string; model?: undefined };

export const hasValue = (stateObj: HassEntity): boolean => !NO_VALUE_STATES.includes(stateObj.state);

export const computeSliderModel = (config: EntityRangeSliderConfig, hass: HomeAssistant): SliderModelResult => {
	const language = languageOf(hass);
	const lower = hass.states[config.entity_low];
	const upper = hass.states[config.entity_high];
	const missing = [config.entity_low, config.entity_high].find((entityId) => !hass.states[entityId]);
	if (missing) {
		return { warning: createEntityNotFoundWarning(hass, missing) };
	}
	const kind = kindOf(lower);
	if (!kind || kindOf(upper) !== kind) {
		return { warning: translate("warning.mixed_kinds", language) };
	}
	const range = kind.range(config, lower, upper, hass);
	if (!Number.isFinite(range.min) || !Number.isFinite(range.max)) {
		return { warning: translate("warning.bad_limit", language) };
	}
	if (!(range.min < range.max)) {
		return { warning: translate("warning.bad_range", language) };
	}
	const values: [number, number] = [kind.value(lower, hass), kind.value(upper, hass)];
	return {
		model: {
			kind,
			range,
			lower,
			upper,
			values,
			disabled: ![lower, upper].every(hasValue) || !values.every(Number.isFinite),
			show: config.show ?? "both",
			// A full width slider leaves no room next to it.
			position: config.full_width ? "below" : isSet(config.position) ? config.position : kind.position,
		},
	};
};

// The values of the entities as one text, or the state of an entity without
// a value, like Home Assistant shows it.
export const formatValues = (model: SliderModel, stateObjs: HassEntity[], hass: HomeAssistant): string => {
	if (!stateObjs.length) {
		return "";
	}
	const noValue = stateObjs.find((stateObj) => !hasValue(stateObj));
	return noValue ? hass.formatEntityState(noValue) : model.kind.format(stateObjs, model.range, hass);
};
