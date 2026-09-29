/*
 * Entity range slider for Home Assistant dashboards.
 *
 * One slider with two handles. The handle for the lower value sets
 * entity_low, the handle for the upper value sets entity_high. Both hold
 * numbers, times, dates or dates with times. It uses Home Assistant's own
 * slider and entity row, so it looks like the built-in number slider and
 * follows the theme.
 */

import { findEntityPair } from "./entity-pair";
import { CARD_TAG, EntityRangeSliderCard } from "./entity-range-slider-card";
import { EDITOR_TAG, EntityRangeSliderEditor } from "./entity-range-slider-editor";
import { EntityRangeSliderRow, ROW_TAG } from "./entity-range-slider-row";
import { languageOf, translate } from "./i18n";

// Set by the build from package.json.
declare const __VERSION__: string;
const VERSION = __VERSION__;
const REPOSITORY = "https://github.com/mm98/ha-entity-range-slider";

// Skips a tag that is already defined, for example when the card is loaded twice.
const defineOnce = (tag: string, element: CustomElementConstructor): void => {
	if (!customElements.get(tag)) {
		customElements.define(tag, element);
	}
};

// The row first: the card creates one.
defineOnce(ROW_TAG, EntityRangeSliderRow);
defineOnce(EDITOR_TAG, EntityRangeSliderEditor);
defineOnce(CARD_TAG, EntityRangeSliderCard);

window.customCards ??= [];
if (!window.customCards.some((card) => card.type === CARD_TAG)) {
	window.customCards.push({
		type: CARD_TAG,
		// The product name, the same in every language.
		name: "Entity range slider",
		// Read when the card picker opens, so it follows the current language.
		get description() {
			return translate("card.description", languageOf());
		},
		preview: true,
		documentationURL: REPOSITORY,
		getEntitySuggestion: (hass, entityId) => {
			const pair = findEntityPair(hass, entityId);
			return pair ? { config: { type: `custom:${CARD_TAG}`, ...pair } } : null;
		},
	});
}

// The one console call on purpose: the version in the browser console, to
// tell which build is loaded.
console.info(`entity-range-slider ${VERSION}`);
