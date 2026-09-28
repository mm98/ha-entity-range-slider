// Checks the config. Home Assistant shows the error when one is wrong, like
// its own cards, in English. Home Assistant's own keys (type, view_layout,
// layout_options, grid_options, visibility, disabled) are never rejected.

import { type EditorConfig, type EntityRangeSliderConfig, isSet, POSITIONS, SHOW_OPTIONS } from "./config";
import { DOMAINS, kindsOfEntity } from "./kinds";

const BOOLEAN_KEYS = ["full_width", "push", "small"] as const;

// The config the editor can show. The entities may still be missing.
export function validateEditorConfig(config: unknown): asserts config is EditorConfig {
	if (!config || typeof config !== "object") {
		throw new Error("The settings must be a map.");
	}
	const values = config as Record<string, unknown>;
	for (const key of ["entity_min", "entity_max", "icon", "unit"] as const) {
		if (isSet(values[key]) && typeof values[key] !== "string") {
			throw new Error(`${key} must be text.`);
		}
	}
	for (const key of ["min", "max", "step"] as const) {
		if (isSet(values[key]) && !["string", "number"].includes(typeof values[key])) {
			throw new Error(`${key} must be a number, a date or a time.`);
		}
	}
	if (isSet(values.show) && !(SHOW_OPTIONS as readonly unknown[]).includes(values.show)) {
		throw new Error(`show must be one of: ${SHOW_OPTIONS.join(", ")}.`);
	}
	if (isSet(values.position) && !(POSITIONS as readonly unknown[]).includes(values.position)) {
		throw new Error(`position must be one of: ${POSITIONS.join(", ")}.`);
	}
	for (const key of BOOLEAN_KEYS) {
		if (isSet(values[key]) && typeof values[key] !== "boolean") {
			throw new Error(`${key} must be true or false.`);
		}
	}
}

// The config the card and the row can show.
export function validateConfig(config: unknown): asserts config is EntityRangeSliderConfig {
	validateEditorConfig(config);
	const { entity_min, entity_max } = config;
	if (!entity_min || !entity_max) {
		throw new Error("Set both entity_min and entity_max.");
	}
	if (entity_min === entity_max) {
		throw new Error("entity_min and entity_max must be two different entities.");
	}
	for (const [key, entityId] of [
		["entity_min", entity_min],
		["entity_max", entity_max],
	] as const) {
		if (!kindsOfEntity(entityId).length) {
			throw new Error(`${key} must be one of these entity types: ${DOMAINS.join(", ")}.`);
		}
	}
	const upperKinds = kindsOfEntity(entity_max);
	const kinds = kindsOfEntity(entity_min).filter((kind) => upperKinds.includes(kind));
	if (!kinds.length) {
		throw new Error(
			"entity_min and entity_max must hold the same kind of value: numbers, times, dates, or dates with times.",
		);
	}
	if (isSet(config.step) && !(Number(config.step) > 0)) {
		throw new Error("step must be a number above 0.");
	}
	// Settings like min and max depend on the kind. The kind is certain when
	// only one fits both domains, for example numbers.
	if (kinds.length === 1) {
		kinds[0].validateConfig?.(config);
	}
}
