// The visual editor, for the card and for the row in an entities card. It uses
// Home Assistant's form (ha-form) and selectors, and is laid out like Home
// Assistant's tile card editor: the entities first, then sections that open.

import { html, LitElement, nothing, type TemplateResult } from "lit";
import { property, state } from "lit/decorators.js";
import type { EditorConfig } from "./config";
import { buildSchema, type SchemaOptions } from "./editor-schema";
import { computePairName } from "./entity-pair";
import {
	fireEvent,
	type HomeAssistant,
	loadEditorElements,
	type LovelaceCardConfig,
	type LovelaceCardEditor,
	type ValueChangedEvent,
} from "./home-assistant";
import { hasTranslation, languageOf, translate } from "./i18n";
import { kindOf, kindsOfEntity } from "./kinds";
import { validateEditorConfig } from "./validators";

export const EDITOR_TAG = "entity-range-slider-editor";

export class EntityRangeSliderEditor extends LitElement implements LovelaceCardEditor {
	@property({ attribute: false }) accessor hass: HomeAssistant | undefined;

	@state() private accessor _config: EditorConfig | undefined;

	// Home Assistant's form is loaded.
	@state() private accessor _ready = false;

	private _schemaKey?: string;
	private _schema?: ReturnType<typeof buildSchema>;

	setConfig(config: LovelaceCardConfig): void {
		// Settings the form cannot show make Home Assistant switch to YAML.
		validateEditorConfig(config);
		this._config = config;
	}

	override connectedCallback(): void {
		super.connectedCallback();
		loadEditorElements().then(
			() => {
				this._ready = true;
			},
			() => {
				// Nothing to show without Home Assistant's form. The next connect
				// tries again.
			},
		);
	}

	protected override render(): TemplateResult | typeof nothing {
		if (!this.hass || !this._config || !this._ready) {
			return nothing;
		}
		return html`
			<ha-form
				.hass=${this.hass}
				.data=${this._config}
				.schema=${this._currentSchema(this.hass, this._config)}
				.computeLabel=${this._computeLabel}
				.computeHelper=${this._computeHelper}
				@value-changed=${this._valueChanged}
			></ha-form>
		`;
	}

	// The form changes with the language, the entities and full_width. It is
	// only built again when one of them changed, so the form keeps its state.
	private _currentSchema(hass: HomeAssistant, config: EditorConfig) {
		const lower = config.entity_low ? hass.states[config.entity_low] : undefined;
		const upper = config.entity_high ? hass.states[config.entity_high] : undefined;
		const kinds = config.entity_low ? kindsOfEntity(config.entity_low) : [];
		const kind = (lower && kindOf(lower)) || (kinds.length === 1 ? kinds[0] : undefined);
		const options: SchemaOptions = {
			language: languageOf(hass),
			defaults: kind?.defaults(lower, upper) ?? {},
			defaultName: lower && upper ? computePairName(hass, lower, upper) : undefined,
			fullWidth: config.full_width === true,
		};
		const key = JSON.stringify(options);
		if (key !== this._schemaKey) {
			this._schemaKey = key;
			this._schema = buildSchema(options);
		}
		return this._schema;
	}

	// The card's own texts, else Home Assistant's labels for its generic
	// fields, like its form editor for cards does.
	private _computeLabel = (schema: { name: string }): string => {
		const key = `label.${schema.name}`;
		if (hasTranslation(key)) {
			return translate(key, languageOf(this.hass));
		}
		const section = schema.name === "secondary_info" ? "entity-row" : "generic";
		// ha-form only asks for labels after render, which needs hass.
		return this.hass!.localize(`ui.panel.lovelace.editor.card.${section}.${schema.name}`);
	};

	private _computeHelper = (schema: { name: string }): string | undefined => {
		const key = `helper.${schema.name}`;
		return hasTranslation(key) ? translate(key, languageOf(this.hass)) : undefined;
	};

	private _valueChanged(ev: ValueChangedEvent<EditorConfig>): void {
		ev.stopPropagation();
		fireEvent(this, "config-changed", { config: ev.detail.value });
	}
}

declare global {
	interface HASSDomEvents {
		"config-changed": { config: EditorConfig };
	}

	interface HTMLElementTagNameMap {
		"entity-range-slider-editor": EntityRangeSliderEditor;
	}
}
