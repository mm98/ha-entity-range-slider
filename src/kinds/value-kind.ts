import type { EditorConfig, EntityRangeSliderConfig, Position } from "../config";
import type { HassEntity, HomeAssistant } from "../home-assistant";

// The slider's outer limits, its step and the unit shown after numbers.
export interface SliderRange {
	min: number;
	max: number;
	step: number;
	unit: string;
}

// The settings the editor shows as defaults in its empty fields.
export type SliderRangeDefaults = Partial<Record<"min" | "max" | "step" | "unit", string>>;

// A kind of value the two entities hold, like numbers or times. The slider
// only knows numbers, so each kind turns its values into numbers and back.
// To support a new kind, add an object like this to kinds/index.ts.
export interface ValueKind {
	// Used in messages.
	readonly id: string;
	// Entity domains that can hold this kind of value.
	readonly domains: readonly string[];
	// Where the values show when the config does not say.
	readonly position: Position;
	// Whether an entity holds this kind of value.
	holds(stateObj: HassEntity): boolean;
	// Checks the settings that belong to this kind, before any state is known.
	// Throws an error that Home Assistant shows in the dashboard.
	validateConfig?(config: EditorConfig): void;
	// Outer limits, step and unit from the config, else from the defaults.
	// NaN limits mean a setting could not be read.
	range(config: EntityRangeSliderConfig, lower: HassEntity, upper: HassEntity, hass: HomeAssistant): SliderRange;
	// The defaults, as text for the editor.
	defaults(lower?: HassEntity, upper?: HassEntity): SliderRangeDefaults;
	// An entity's value on the slider. NaN when it has none.
	value(stateObj: HassEntity, hass: HomeAssistant): number;
	// A slider value as it is saved.
	round(value: number, range: SliderRange): number;
	// The values of one or two entities as one text.
	format(stateObjs: HassEntity[], range: SliderRange, hass: HomeAssistant): string;
	// The text in the slider's tooltip, for ha-slider's valueFormatter.
	// Without it the slider shows its own.
	valueFormatter?(hass: HomeAssistant): (value: number) => string;
	// Saves a slider value with the entity's own action. Dates with times also
	// need the time zones.
	save(hass: Pick<HomeAssistant, "callService" | "config" | "locale">, entityId: string, value: number): Promise<unknown>;
}
