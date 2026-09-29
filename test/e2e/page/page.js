// The page the end-to-end tests run on: Home Assistant's real slider (the Web
// Awesome version Home Assistant ships) with its styles, small stand-ins for
// Home Assistant's entity row, warning and card, and a fake hass object. The
// tests add the cards they need with window.addCard.

import "@home-assistant/webawesome/dist/styles/webawesome.css";
import Slider from "@home-assistant/webawesome/dist/components/slider/slider.js";

// src/components/ha-slider.ts, frontend 20260826.7.
const HA_SLIDER_CSS = `
:host {
	--track-size: var(--ha-slider-track-size, 4px);
	--marker-height: calc(var(--ha-slider-track-size, 4px) / 2);
	--marker-width: calc(var(--ha-slider-track-size, 4px) / 2);
	--wa-color-surface-default: var(--card-background-color);
	--wa-color-neutral-fill-normal: var(--ha-slider-track-color, var(--disabled-color));
	--wa-tooltip-background-color: var(--ha-tooltip-background-color, var(--secondary-background-color));
	--wa-tooltip-content-color: var(--ha-tooltip-text-color, var(--primary-text-color));
	--wa-tooltip-arrow-size: var(--ha-tooltip-arrow-size, 0px);
	--wa-tooltip-border-width: 0px;
	--wa-z-index-tooltip: 1000;
	min-width: 100px;
	min-inline-size: 100px;
	width: 200px;
}
#slider { padding-block: 14px; margin-block: -14px; }
#thumb { border: none; background-color: var(--ha-slider-thumb-color, var(--primary-color)); overflow: hidden; }
#track:after { content: ""; position: absolute; top: calc(-50% - 4px); left: 0; width: 100%; height: calc(var(--track-size) * 2 + 8px); cursor: pointer; }
#indicator { background-color: var(--ha-slider-indicator-color, var(--primary-color)); }
:host([size="m"]) { --thumb-width: 20px; --thumb-height: 20px; }
:host([size="s"]) { --thumb-width: 16px; --thumb-height: 16px; }
`;
const haSliderSheet = new CSSStyleSheet();
haSliderSheet.replaceSync(HA_SLIDER_CSS);

// src/panels/lovelace/components/hui-generic-entity-row.ts, layout only.
const GENERIC_ROW_CSS = `
:host { display: flex; align-items: center; flex-direction: row; }
.icon { flex: 0 0 40px; height: 40px; }
.info { padding-inline-start: 16px; padding-inline-end: 8px; flex: 1 1 30%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
`;

// Home Assistant defines these when a dashboard first needs them, so the
// stand-ins are defined a moment after the card asks for them.
const defineHomeAssistantElements = () => {
	if (customElements.get("ha-slider")) {
		return;
	}
	class HaSlider extends Slider {
		static get styles() {
			return [Slider.styles, haSliderSheet];
		}
		connectedCallback() {
			super.connectedCallback();
			this.withTooltip = true;
			this.setAttribute("size", "s");
			this.dir = document.dir;
		}
	}
	customElements.define("ha-slider", HaSlider);
	customElements.define(
		"hui-generic-entity-row",
		class extends HTMLElement {
			constructor() {
				super();
				this.attachShadow({ mode: "open" }).innerHTML =
					`<style>${GENERIC_ROW_CSS}</style><div class="icon"></div><div class="info"></div><slot></slot>`;
			}
			set config(config) {
				this._config = config;
				this._render();
			}
			set hass(hass) {
				this._hass = hass;
				this._render();
			}
			_render() {
				if (this._config && this._hass) {
					this.shadowRoot.querySelector(".info").textContent = this._hass.formatEntityName(
						this._hass.states[this._config.entity],
						this._config.name,
					);
				}
			}
		},
	);
	customElements.define(
		"hui-warning",
		class extends HTMLElement {
			constructor() {
				super();
				this.attachShadow({ mode: "open" }).innerHTML = "<slot></slot>";
			}
		},
	);
};

customElements.define(
	"ha-card",
	class extends HTMLElement {
		constructor() {
			super();
			this.attachShadow({ mode: "open" }).innerHTML = `<style>
				:host { display: block; background: var(--card-background-color); border: 1px solid var(--divider-color); border-radius: var(--ha-border-radius-lg); }
				:host ::slotted(.card-content) { padding: var(--ha-space-4); }
			</style><slot></slot>`;
		}
	},
);

window.loadCardHelpers = async () => ({
	createRowElement: () => {
		setTimeout(defineHomeAssistantElements, 100);
		return document.createElement("div");
	},
});

// The fake Home Assistant.
const entity = (entityId, state, attributes = {}) => ({
	entity_id: entityId,
	state: String(state),
	attributes,
	last_changed: "2026-10-01T00:00:00+00:00",
	last_updated: "2026-10-01T00:00:00+00:00",
});
const number = (entityId, state) =>
	entity(entityId, state, { min: 0, max: 30, step: 0.5, unit_of_measurement: "°C", friendly_name: entityId });
const inputDatetime = (entityId, state, hasDate, hasTime) =>
	entity(entityId, state, { has_date: hasDate, has_time: hasTime, friendly_name: entityId });

let states = Object.fromEntries(
	[
		number("input_number.heating_low", "18.0"),
		number("input_number.heating_high", "22.0"),
		// Saving these fails, like when Home Assistant rejects a value.
		number("input_number.failing_low", "18.0"),
		number("input_number.failing_high", "22.0"),
		inputDatetime("input_datetime.heating_start", "06:30:00", false, true),
		inputDatetime("input_datetime.heating_end", "22:00:00", false, true),
		inputDatetime("input_datetime.vacation_from", "2026-10-05", true, false),
		inputDatetime("input_datetime.vacation_to", "2026-10-12", true, false),
		inputDatetime("input_datetime.guests_start", "2026-10-01 07:00:00", true, true),
		inputDatetime("input_datetime.guests_end", "2026-10-03 18:00:00", true, true),
		entity("datetime.charging_start", "2026-10-02T08:00:00+00:00"),
		entity("datetime.charging_end", "2026-10-03T08:00:00+00:00"),
	].map((stateObj) => [stateObj.entity_id, stateObj]),
);

const calls = [];
const listeners = new Set();
// Like in Home Assistant, these stay the same objects between updates.
const locale = { language: "en", number_format: "language", time_format: "24", time_zone: "server" };
const entities = {};
const config = { state: "RUNNING", time_zone: "Europe/Copenhagen" };
const localize = (key, values = {}) =>
	({ "ui.panel.lovelace.warning.entity_not_found": "Entity not available: {entity}" })[key]?.replace(
		/\{(\w+)\}/g,
		(_, name) => values[name] ?? "",
	) ?? key;
const formatEntityState = (stateObj) => stateObj.state;
const formatEntityName = (stateObj, name) => (typeof name === "string" ? name : stateObj.attributes.friendly_name);

const createHass = () => ({
	states,
	entities,
	language: "en",
	locale,
	config,
	connected: true,
	themes: {},
	localize,
	formatEntityState,
	formatEntityName,
	callService: async (domain, service, data, target) => {
		calls.push({ domain, service, data, entity_id: target.entity_id });
		if (target.entity_id.startsWith("input_number.failing_")) {
			throw new Error("Saving failed on purpose");
		}
		await new Promise((resolve) => setTimeout(resolve, 30));
		const value = data.value ?? data.time ?? data.date ?? data.datetime;
		let state = String(value);
		if (domain === "input_number") {
			// input_number stores a float, so 22 becomes "22.0" like in Home Assistant.
			state = Number(value).toFixed(1);
		} else if (domain === "datetime") {
			// Home Assistant keeps datetime states in UTC.
			state = new Date(value).toISOString().replace(".000Z", "+00:00");
		}
		setState(target.entity_id, state);
	},
});

let hass = createHass();

const setState = (entityId, state) => {
	states = { ...states, [entityId]: { ...states[entityId], state: String(state) } };
	hass = createHass();
	for (const element of listeners) {
		element.hass = hass;
	}
};

await import("../../../dist/entity-range-slider.js");

// Adds a card, or a row in a card like Home Assistant's entities card.
const addCard = (id, cardConfig, { row = false } = {}) => {
	const element = document.createElement(row ? "entity-range-slider-row" : "entity-range-slider");
	element.id = id;
	element.setConfig(cardConfig);
	element.hass = hass;
	listeners.add(element);
	if (row) {
		const card = document.createElement("ha-card");
		const content = document.createElement("div");
		content.className = "card-content";
		content.append(element);
		card.append(content);
		document.getElementById("cards").append(card);
	} else {
		document.getElementById("cards").append(element);
	}
};

Object.assign(window, { addCard, setState, calls, getStates: () => states });
window.pageReady = true;
