// The card's config. The row in an entities card takes the same config.
// Settings of Home Assistant's entity row (icon, color, secondary_info,
// time_format and the actions) go to that row as they are. Optional keys stay
// optional, and defaults are never written into the saved YAML.

import type { EntityName, LovelaceCardConfig } from "./home-assistant";

// Which values the card shows.
export const SHOW_OPTIONS = ["both", "low", "high", "none"] as const;

// Where the values show: next to the slider, like the value of Home
// Assistant's number slider, or below it.
export const POSITIONS = ["inline", "below"] as const;

export type ShowOption = (typeof SHOW_OPTIONS)[number];
export type Position = (typeof POSITIONS)[number];

// What the visual editor holds: the entities may still be missing.
export interface EditorConfig extends LovelaceCardConfig {
	entity_low?: string;
	entity_high?: string;
	name?: EntityName;
	icon?: string;
	min?: string | number;
	max?: string | number;
	step?: string | number;
	unit?: string;
	show?: ShowOption;
	position?: Position;
	full_width?: boolean;
	small?: boolean;
	push?: boolean;
}

// What the card and the row show.
export interface EntityRangeSliderConfig extends EditorConfig {
	entity_low: string;
	entity_high: string;
}

// Whether a setting has a value. An emptied field in the editor counts as none.
export const isSet = <T>(value: T): value is Exclude<T, undefined | null | ""> =>
	value !== undefined && value !== null && value !== "";
