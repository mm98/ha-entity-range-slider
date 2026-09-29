// The fields of the visual editor, as an ha-form schema. Kept apart from the
// editor element so it can be checked without Home Assistant's form.

import { POSITIONS, SHOW_OPTIONS } from "./config";
import { translate, type TranslationKey } from "./i18n";
import { DOMAINS, type SliderRangeDefaults } from "./kinds";

export interface SchemaOptions {
	language: string;
	defaults: SliderRangeDefaults;
	defaultName?: string;
	fullWidth: boolean;
}

// An ha-form select selector with the card's texts for the options.
const selectSelector = (options: readonly string[], group: "show" | "position", language: string) => ({
	select: {
		mode: "dropdown",
		options: options.map((value) => ({ value, label: translate(`${group}.${value}` as TranslationKey, language) })),
	},
});

export const buildSchema = ({ language, defaults, defaultName, fullWidth }: SchemaOptions) => {
	const entity = { entity: { filter: { domain: DOMAINS } } };
	return [
		{ name: "entity_low", required: true, selector: entity },
		{ name: "entity_high", required: true, selector: entity },
		{
			name: "content",
			type: "expandable",
			flatten: true,
			expanded: true,
			icon: "mdi:text-short",
			schema: [
				{ name: "name", selector: { entity_name: { default_name: defaultName } }, context: { entity: "entity_low" } },
				{
					name: "",
					type: "grid",
					schema: [
						{ name: "icon", selector: { icon: {} }, context: { icon_entity: "entity_low" } },
						{ name: "color", selector: { ui_color: { include_state: true, include_none: true } } },
					],
				},
				{
					name: "secondary_info",
					selector: { ui_state_content: { allow_context: true } },
					context: { filter_entity: "entity_low" },
				},
				{ name: "show", selector: selectSelector(SHOW_OPTIONS, "show", language) },
				// A full width slider always shows the values below it.
				{ name: "position", disabled: fullWidth, selector: selectSelector(POSITIONS, "position", language) },
				{ name: "full_width", selector: { boolean: {} } },
				{ name: "small", selector: { boolean: {} } },
			],
		},
		{
			name: "slider",
			type: "expandable",
			flatten: true,
			icon: "mdi:tune-variant",
			schema: [
				{
					name: "",
					type: "grid",
					schema: [
						{ name: "min", selector: { text: {} }, default: defaults.min },
						{ name: "max", selector: { text: {} }, default: defaults.max },
						{ name: "step", selector: { number: { mode: "box", step: "any", min: 0 } }, default: defaults.step },
						{ name: "unit", selector: { text: {} }, default: defaults.unit },
					],
				},
				{ name: "push", selector: { boolean: {} } },
			],
		},
		{
			name: "interactions",
			type: "expandable",
			flatten: true,
			icon: "mdi:gesture-tap",
			schema: [
				{ name: "tap_action", selector: { ui_action: { default_action: "more-info" } } },
				{ name: "hold_action", selector: { ui_action: { default_action: "more-info" } } },
				{ name: "double_tap_action", selector: { ui_action: { default_action: "none" } } },
			],
		},
	];
};
