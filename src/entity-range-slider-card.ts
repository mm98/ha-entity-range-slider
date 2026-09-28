// The range slider as a dashboard card: the row inside Home Assistant's card.

import { css, html, LitElement, type TemplateResult } from "lit";
import { state } from "lit/decorators.js";
import type { EntityRangeSliderConfig } from "./config";
import { stubConfig } from "./entity-pair";
import { EDITOR_TAG } from "./entity-range-slider-editor";
import { ROW_TAG } from "./entity-range-slider-row";
import type {
	HomeAssistant,
	LovelaceCard,
	LovelaceCardConfig,
	LovelaceCardEditor,
	LovelaceGridOptions,
} from "./home-assistant";
import { validateConfig } from "./validators";

export const CARD_TAG = "entity-range-slider";

export class EntityRangeSliderCard extends LitElement implements LovelaceCard {
	static override styles = css`
		:host {
			display: block;
		}
		ha-card {
			height: 100%;
		}
	`;

	@state() private accessor _config: EntityRangeSliderConfig | undefined;

	private readonly _row = document.createElement(ROW_TAG);

	static getConfigElement(): LovelaceCardEditor {
		return document.createElement(EDITOR_TAG);
	}

	static getStubConfig(hass: HomeAssistant, entities?: string[], entitiesFill?: string[]) {
		return stubConfig(hass, entities, entitiesFill);
	}

	// The row decides itself when to draw again.
	set hass(hass: HomeAssistant) {
		this._row.hass = hass;
	}

	setConfig(config: LovelaceCardConfig): void {
		validateConfig(config);
		this._config = config;
		this._row.setConfig(config);
	}

	getCardSize(): number {
		return 1;
	}

	getGridOptions(): LovelaceGridOptions {
		return { columns: 12, min_columns: 6 };
	}

	protected override render(): TemplateResult {
		return html`
			<ha-card>
				<div class="card-content">${this._row}</div>
			</ha-card>
		`;
	}
}

declare global {
	interface HTMLElementTagNameMap {
		"entity-range-slider": EntityRangeSliderCard;
	}
}
