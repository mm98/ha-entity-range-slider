// Everything the card takes from Home Assistant's frontend, as small copies
// under Home Assistant's own names. Each copy names its source file in the
// frontend repository, checked at tag 20260826.7, so it can be checked again
// on each release. Types only hold the members the card uses.

declare global {
	interface Window {
		// src/data/lovelace_custom_cards.ts (CustomCardsWindow)
		customCards?: CustomCardEntry[];
		// src/panels/lovelace/custom-card-helpers.ts
		loadCardHelpers(): Promise<CustomCardHelpers>;
	}

	// src/common/dom/fire_event.ts and src/types.ts
	interface HASSDomEvents {
		"value-changed": {
			value: unknown;
		};
	}

	interface HTMLElementTagNameMap {
		"ha-slider": HaSlider;
	}
}

// home-assistant-js-websocket (HassEntity)
export interface HassEntity {
	entity_id: string;
	state: string;
	attributes: {
		friendly_name?: string;
		unit_of_measurement?: string;
		min?: number;
		max?: number;
		step?: number;
		has_date?: boolean;
		has_time?: boolean;
		[key: string]: unknown;
	};
	last_changed: string;
	last_updated: string;
}

// home-assistant-js-websocket (HassServiceTarget)
export interface HassServiceTarget {
	entity_id?: string | string[];
	device_id?: string | string[];
	area_id?: string | string[];
	floor_id?: string | string[];
	label_id?: string | string[];
}

// src/data/entity/entity_registry.ts
export interface EntityRegistryDisplayEntry {
	entity_id: string;
	display_precision?: number;
}

// src/data/translation.ts, with the enums written as their values.
export interface FrontendLocaleData {
	language: string;
	number_format: "language" | "system" | "comma_decimal" | "decimal_comma" | "quote_decimal" | "space_comma" | "none";
	time_format: "language" | "system" | "12" | "24";
	time_zone: "local" | "server";
}

// src/common/entity/compute_entity_name_display.ts
export type EntityNameItem = { type: "entity" | "device" | "area" | "floor" } | { type: "text"; text: string };

// Home Assistant writes this union inline where a name is set.
export type EntityName = string | EntityNameItem | EntityNameItem[];

// src/types.ts
export interface HomeAssistant {
	states: Record<string, HassEntity>;
	entities: Record<string, EntityRegistryDisplayEntry>;
	config: {
		time_zone: string;
		state: "NOT_RUNNING" | "STARTING" | "RUNNING" | "STOPPING" | "FINAL_WRITE";
	};
	locale: FrontendLocaleData;
	language: string;
	connected: boolean;
	themes: unknown;
	localize(key: string, values?: Record<string, unknown>): string;
	formatEntityState(stateObj: HassEntity, state?: string): string;
	formatEntityAttributeName(stateObj: HassEntity, attribute: string): string;
	formatEntityAttributeValue(stateObj: HassEntity, attribute: string, value?: unknown): string;
	formatEntityName(stateObj: HassEntity, type: EntityName | undefined, options?: { separator?: string }): string;
	callService(
		domain: string,
		service: string,
		serviceData?: Record<string, unknown>,
		target?: HassServiceTarget,
		notifyOnError?: boolean,
		returnResponse?: boolean,
	): Promise<unknown>;
}

// src/data/lovelace/config/card.ts. The index signature is unknown instead of
// Home Assistant's any, so every other key is checked before it is used.
export interface LovelaceCardConfig {
	type: string;
	[key: string]: unknown;
}

// src/panels/lovelace/types.ts
export interface LovelaceGridOptions {
	columns?: number | "full";
	rows?: number | "auto";
	max_columns?: number;
	min_columns?: number;
	min_rows?: number;
	max_rows?: number;
}

// src/panels/lovelace/types.ts
export interface LovelaceCard extends HTMLElement {
	hass?: HomeAssistant;
	preview?: boolean;
	getCardSize(): number | Promise<number>;
	getGridOptions?(): LovelaceGridOptions;
	setConfig(config: LovelaceCardConfig): void;
}

// src/panels/lovelace/entity-rows/types.ts
export interface LovelaceRow extends HTMLElement {
	hass?: HomeAssistant;
	preview?: boolean;
	setConfig(config: LovelaceCardConfig): void;
}

// src/panels/lovelace/types.ts (LovelaceCardEditor and LovelaceGenericElementEditor)
export interface LovelaceCardEditor extends HTMLElement {
	hass?: HomeAssistant;
	setConfig(config: LovelaceCardConfig): void;
}

// src/data/lovelace_custom_cards.ts
export interface CustomCardSuggestion {
	label?: string;
	config: LovelaceCardConfig;
}

// src/data/lovelace_custom_cards.ts
export interface CustomCardEntry {
	type: string;
	name?: string;
	description?: string;
	preview?: boolean;
	documentationURL?: string;
	getEntitySuggestion?: (
		hass: HomeAssistant,
		entityId: string,
	) => CustomCardSuggestion | CustomCardSuggestion[] | null;
}

// src/panels/lovelace/custom-card-helpers.ts, what window.loadCardHelpers() returns.
export interface CustomCardHelpers {
	createRowElement(config: LovelaceCardConfig): HTMLElement;
	createCardElement(config: LovelaceCardConfig): HTMLElement;
}

// src/components/ha-slider.ts: Home Assistant's slider (a Web Awesome slider)
// in range mode. "thumb" is the slider's own word for a handle.
export interface HaSlider extends HTMLElement {
	range: boolean;
	min: number;
	max: number;
	step: number;
	minValue: number;
	maxValue: number;
	disabled: boolean;
	activeThumb: "min" | "max" | null;
	valueWhenDraggingStarted: number;
	valueFormatter: (value: number) => string;
	setThumbValueFromCoordinates?: (x: number, y: number, thumb: "min" | "max") => void;
	showRangeTooltips?: () => void;
}

// src/common/dom/fire_event.ts
export interface HASSDomEvent<T> extends Event {
	detail: T;
}

// src/common/dom/fire_event.ts
export type HASSDomTargetEvent<T extends EventTarget> = Event & {
	target: T;
};

// src/common/dom/fire_event.ts
export type HASSDomCurrentTargetEvent<T extends EventTarget> = Event & {
	currentTarget: T;
};

// src/types.ts
export interface ValueChangedEvent<T> extends CustomEvent {
	detail: {
		value: T;
	};
}

// src/data/entity/entity.ts
export const UNAVAILABLE = "unavailable";
export const UNKNOWN = "unknown";

// src/common/entity/compute_domain.ts
export const computeDomain = (entityId: string): string => entityId.substring(0, entityId.indexOf("."));

// src/common/dom/fire_event.ts
export const fireEvent = <HassEvent extends keyof HASSDomEvents>(
	node: HTMLElement | Window,
	type: HassEvent,
	detail?: HASSDomEvents[HassEvent],
	options?: {
		bubbles?: boolean;
		cancelable?: boolean;
		composed?: boolean;
	},
): Event => {
	options = options || {};
	const event = new Event(type, {
		bubbles: options.bubbles === undefined ? true : options.bubbles,
		cancelable: Boolean(options.cancelable),
		composed: options.composed === undefined ? true : options.composed,
	});
	(event as HASSDomEvent<unknown>).detail = detail === null || detail === undefined ? {} : detail;
	node.dispatchEvent(event);
	return event;
};

// The hass keys that change what the row shows. The list of
// src/panels/lovelace/common/has-changed.ts, plus formatEntityName, which
// names the row, and the server time zone, which dates and times follow.
// The formatters arrive a moment after the first hass object.
const DISPLAY_KEYS = [
	"connected",
	"themes",
	"locale",
	"localize",
	"formatEntityState",
	"formatEntityAttributeName",
	"formatEntityAttributeValue",
	"formatEntityName",
] as const;

// Like src/panels/lovelace/common/has-changed.ts: only redraw when one of the
// entities or the way things are shown changed.
export const hasHassChanged = (old: HomeAssistant | undefined, hass: HomeAssistant, entityIds: string[]): boolean =>
	!old ||
	DISPLAY_KEYS.some((key) => old[key] !== hass[key]) ||
	old.config.state !== hass.config.state ||
	old.config.time_zone !== hass.config.time_zone ||
	entityIds.some(
		(entityId) => old.states[entityId] !== hass.states[entityId] || old.entities[entityId] !== hass.entities[entityId],
	);

// Like createEntityNotFoundWarning in src/panels/lovelace/components/hui-warning.ts,
// but with Home Assistant's text that names the entity, as the card has two.
export const createEntityNotFoundWarning = (
	hass: Pick<HomeAssistant, "config" | "localize">,
	entityId: string,
): string =>
	hass.config.state !== "NOT_RUNNING"
		? hass.localize("ui.panel.lovelace.warning.entity_not_found", { entity: entityId })
		: hass.localize("ui.panel.lovelace.warning.starting");

// Home Assistant loads its elements only when a dashboard needs them.
// Creating an element that is never shown makes it load them.
const loading = new Map<string, Promise<void>>();

// A failed load is forgotten, so the next element that connects tries again.
const loadOnce = (key: string, tags: string[], load: () => Promise<unknown>): Promise<void> => {
	let promise = loading.get(key);
	if (!promise) {
		promise = (async () => {
			if (!tags.every((tag) => customElements.get(tag))) {
				await load();
				await Promise.all(tags.map((tag) => customElements.whenDefined(tag)));
			}
		})();
		promise.catch(() => loading.delete(key));
		loading.set(key, promise);
	}
	return promise;
};

// The slider, the entity row and the warning, through a number row.
export const loadRowElements = (): Promise<void> =>
	loadOnce("row", ["ha-slider", "hui-generic-entity-row", "hui-warning"], async () => {
		(await window.loadCardHelpers()).createRowElement({ type: "input-number-entity" });
	});

// The form of the visual editor, through the entities card's editor.
export const loadEditorElements = (): Promise<void> =>
	loadOnce("editor", ["ha-form"], async () => {
		(await window.loadCardHelpers()).createCardElement({ type: "entities", entities: [] });
		await customElements.whenDefined("hui-entities-card");
		const card = customElements.get("hui-entities-card") as unknown as { getConfigElement(): Promise<unknown> };
		await card.getConfigElement();
	});
