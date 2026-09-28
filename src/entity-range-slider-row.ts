// The range slider as a row, like Home Assistant's number row. The card shows
// this row, and entities cards can hold it as custom:entity-range-slider-row.

import { css, html, LitElement, nothing, type PropertyValues, type TemplateResult } from "lit";
import { property, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { ref } from "lit/directives/ref.js";
import { type EntityRangeSliderConfig, isSet } from "./config";
import { computePairName } from "./entity-pair";
import { EDITOR_TAG } from "./entity-range-slider-editor";
import { stopAtOtherHandle } from "./handles";
import {
	type HaSlider,
	hasHassChanged,
	type HassEntity,
	type HomeAssistant,
	loadRowElements,
	type LovelaceCardConfig,
	type LovelaceCardEditor,
	type LovelaceRow,
} from "./home-assistant";
import { computeSliderModel, formatValues, type SliderModelResult } from "./slider-model";
import { validateConfig } from "./validators";

export const ROW_TAG = "entity-range-slider-row";

// Home Assistant's number row leaves out the value next to the slider on rows
// this narrow.
const NARROW_WIDTH = 300;

export class EntityRangeSliderRow extends LitElement implements LovelaceRow {
	// Home Assistant's number row styles (hui-input-number-entity-row), with the
	// few additions a range needs marked as such.
	static override styles = css`
		:host {
			display: block;
		}
		.flex {
			display: flex;
			align-items: center;
			justify-content: flex-end;
			flex-grow: 2;
		}
		.state {
			min-width: 45px;
			text-align: end;
		}
		/* Home Assistant's ha-slider rule, on the box that holds the slider and
		   the values below it. */
		.slider {
			width: 100%;
			max-width: 200px;
			margin: 1px var(--ha-space-2);
		}
		ha-slider {
			width: 100%;
		}
		/* Added: the value keeps Home Assistant's 45 px and is cut off with an
		   ellipsis when longer, so it never moves the slider or the name. */
		.state {
			max-width: 45px;
		}
		/* Added: with full_width, the slider also takes those 45 px and the
		   margin before them, so it starts where the slider of a number row
		   starts and ends where the values of the rows around it end. */
		.full .slider {
			min-width: calc(100px + 45px + var(--ha-space-2));
			max-width: calc(200px + 45px + var(--ha-space-2));
			margin-inline-end: 0;
		}
		/* Added: the handle at the highest value then reaches past the row into
		   the card's padding, so the row must not cut it off. */
		:host([full]) {
			overflow: visible !important;
		}
		.state,
		.below span {
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}
		/* Added: values below the slider in Home Assistant's secondary text color,
		   clear of the handles, never making the row wider. */
		.below {
			display: flex;
			justify-content: space-between;
			gap: var(--ha-space-2);
			margin-block-start: var(--ha-space-2);
			color: var(--secondary-text-color);
			contain: inline-size;
		}
		[hidden] {
			display: none !important;
		}
		/* Copied from ha-slider: Home Assistant only styles the handle of its
		   one-handle slider (#thumb). Both range handles have the part name
		   "thumb", so they get the same look. */
		ha-slider::part(thumb) {
			border: none;
			background-color: var(--ha-slider-thumb-color, var(--primary-color));
			overflow: hidden;
		}
		ha-slider::part(thumb)::after {
			content: "";
			border-radius: 50%;
			position: absolute;
			width: calc(var(--thumb-width) * 2 + 8px);
			height: calc(var(--thumb-height) * 2 + 8px);
			left: calc(-50% - 4px);
			top: calc(-50% - 4px);
			cursor: pointer;
		}
	`;

	@property({ attribute: false }) accessor hass: HomeAssistant | undefined;

	// Whether the slider uses the full width: full_width is on and the row is
	// not narrow. Worked out in willUpdate.
	@property({ type: Boolean, reflect: true }) accessor full = false;

	@state() private accessor _config: EntityRangeSliderConfig | undefined;

	// Home Assistant's slider and entity row are loaded.
	@state() private accessor _ready = false;

	@state() private accessor _narrow = false;

	// Raised to draw the handles again, for example after a failed save.
	@state() private accessor _redraw = 0;

	private _result?: SliderModelResult;
	private _drawnHass?: HomeAssistant;
	private _slider?: HaSlider;
	// The last slider that got the handle rules, so it never gets them twice.
	private _preparedSlider?: HaSlider;
	private _sliderFormatter?: (value: number) => string;
	private _dragging = false;
	private _settingValues = false;
	// Counts the saves, so only the newest one puts the handles back.
	private _saveCount = 0;
	private _resizeObserver?: ResizeObserver;

	static getConfigElement(): LovelaceCardEditor {
		return document.createElement(EDITOR_TAG);
	}

	setConfig(config: LovelaceCardConfig): void {
		validateConfig(config);
		this._config = config;
	}

	override connectedCallback(): void {
		super.connectedCallback();
		loadRowElements().then(
			() => {
				this._ready = true;
			},
			() => {
				// Nothing to show without Home Assistant's elements. The next
				// connect tries again.
			},
		);
		this._resizeObserver ??= new ResizeObserver(() => {
			this._narrow = this.clientWidth <= NARROW_WIDTH;
		});
		this._resizeObserver.observe(this);
	}

	override disconnectedCallback(): void {
		super.disconnectedCallback();
		this._resizeObserver?.disconnect();
		if (this._dragging) {
			this._dragEnd();
		}
	}

	protected override shouldUpdate(changed: PropertyValues): boolean {
		if (!this._config || !this.hass || !this._ready || this._dragging) {
			// After a drag, the next update shows what changed during it.
			return false;
		}
		return (
			["_config", "_ready", "_narrow", "_redraw"].some((key) => changed.has(key)) ||
			hasHassChanged(this._drawnHass, this.hass, [this._config.entity_min, this._config.entity_max])
		);
	}

	// shouldUpdate only lets an update through with _config and hass set, and
	// willUpdate sets _result, so the ! below in willUpdate, render and updated
	// are safe.
	protected override willUpdate(): void {
		// Also measured here, as resize notifications wait for the page to be shown.
		if (this.clientWidth) {
			this._narrow = this.clientWidth <= NARROW_WIDTH;
		}
		this.full = this._config!.full_width === true && !this._narrow;
		this._drawnHass = this.hass;
		this._result = computeSliderModel(this._config!, this.hass!);
	}

	protected override render(): TemplateResult | typeof nothing {
		const config = this._config!;
		const hass = this.hass!;
		const result = this._result!;
		if (!result.model) {
			return html`<hui-warning .hass=${hass}>${result.warning}</hui-warning>`;
		}
		const model = result.model;
		const { lower, upper, range, show } = model;
		const below = model.position === "below";
		const full = this.full;
		const shown: HassEntity[] = { both: [lower, upper], lower: [lower], upper: [upper], none: [] }[show];
		const text = (value: string) => (config.small && value ? html`<small>${value}</small>` : value);
		const rowConfig = {
			...config,
			entity: config.entity_min,
			name: isSet(config.name) ? config.name : computePairName(hass, lower, upper),
		};
		return html`
			<hui-generic-entity-row .hass=${hass} .config=${rowConfig} .catchInteraction=${false}>
				<div class=${classMap({ flex: true, full })}>
					<div class="slider">
						<ha-slider
							range
							.min=${range.min}
							.max=${range.max}
							.step=${range.step}
							.disabled=${model.disabled}
							${ref(this._sliderRendered)}
							@change=${this._sliderChanged}
						></ha-slider>
						<div class="below" ?hidden=${!below || show === "none"}>
							<span>${text(below && shown.includes(lower) ? formatValues(model, [lower], hass) : "")}</span>
							<span>${text(below && shown.includes(upper) ? formatValues(model, [upper], hass) : "")}</span>
						</div>
					</div>
					<span class="state" ?hidden=${this._narrow || full}>${text(below ? "" : formatValues(model, shown, hass))}</span>
				</div>
			</hui-generic-entity-row>
		`;
	}

	protected override updated(): void {
		const slider = this._slider;
		const model = this._result?.model;
		if (!slider || !model) {
			return;
		}
		slider.valueFormatter = model.kind.valueFormatter?.(this.hass!) ?? this._sliderFormatter!;
		if (!model.disabled) {
			// Also puts the handles back when a value could not be saved.
			this._settingValues = true;
			[slider.minValue, slider.maxValue] = model.values;
			this._settingValues = false;
		}
	}

	// Runs when the slider is drawn, once more for each new slider, and with
	// no element when the slider goes away.
	private _sliderRendered = (element?: Element): void => {
		this._slider = element as HaSlider | undefined;
		const slider = this._slider;
		if (!slider || slider === this._preparedSlider) {
			return;
		}
		this._preparedSlider = slider;
		this._sliderFormatter = slider.valueFormatter;
		stopAtOtherHandle(slider, () => this._settingValues || this._config?.push === true);
		slider.addEventListener("pointerdown", this._dragStart, { capture: true });
	};

	// Updates from Home Assistant must not move a handle while it is dragged.
	private _dragStart = (): void => {
		this._dragging = true;
		window.addEventListener("pointerup", this._dragEnd, true);
		window.addEventListener("pointercancel", this._dragEnd, true);
	};

	private _dragEnd = (): void => {
		this._dragging = false;
		window.removeEventListener("pointerup", this._dragEnd, true);
		window.removeEventListener("pointercancel", this._dragEnd, true);
		this.requestUpdate();
	};

	private async _sliderChanged(): Promise<void> {
		const hass = this.hass!;
		const model = this._result?.model;
		const slider = this._slider;
		if (!model || !slider) {
			return;
		}
		const { kind, range, lower, upper } = model;
		const lowerState = hass.states[lower.entity_id];
		const upperState = hass.states[upper.entity_id];
		if (!lowerState || !upperState) {
			return;
		}
		const lowerNow = kind.value(lowerState, hass);
		const upperNow = kind.value(upperState, hass);
		const lowerValue = kind.round(slider.minValue, range);
		const upperValue = kind.round(slider.maxValue, range);
		const writes: [string, number][] = [];
		if (lowerValue !== lowerNow) {
			writes.push([lower.entity_id, lowerValue]);
		}
		if (upperValue !== upperNow) {
			writes.push([upper.entity_id, upperValue]);
		}
		// When both values go up, save the upper one first, so the lower value
		// is never above the upper value, not even for a moment.
		if (writes.length === 2 && upperValue > upperNow) {
			writes.reverse();
		}
		const save = ++this._saveCount;
		try {
			for (const [entityId, value] of writes) {
				await kind.save(hass, entityId, value);
			}
		} catch {
			// Home Assistant has already shown the error. Put the handles back,
			// unless a newer save has started since.
			if (save === this._saveCount) {
				this._redraw++;
			}
		}
	}
}

declare global {
	interface HTMLElementTagNameMap {
		"entity-range-slider-row": EntityRangeSliderRow;
	}
}
