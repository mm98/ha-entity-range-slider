/*
 * Entity range slider for Home Assistant dashboards.
 *
 * One slider with two handles. The left handle sets entity_min, the right
 * handle sets entity_max. It uses Home Assistant's own slider and entity row,
 * so it looks like the built-in number slider and follows the theme.
 */

const VERSION = "0.1.0";
const CARD_TAG = "entity-range-slider";
const ROW_TAG = "entity-range-slider-row";
const DOMAINS = ["input_number", "number"];
const NO_VALUE_STATES = ["unavailable", "unknown"];
const SHOW_VALUE = ["both", "lower", "upper", "none"];
const VALUE_POSITIONS = ["right", "below"];

// Words that mark the lower and the upper entity of a pair in entity IDs,
// used to suggest the card in the card picker.
const PAIR_WORDS = [
	["min", "max"],
	["min", "maks"],
	["minimum", "maximum"],
	["low", "high"],
	["lav", "hoj"],
	["lower", "upper"],
	["from", "to"],
	["fra", "til"],
	["start", "end"],
	["start", "slut"],
];

// Custom cards bring their own translations. Home Assistant translates the
// labels of generic fields (name, icon) itself.
const TEXTS = {
	en: {
		entity_min: "Entity for the lower value",
		entity_max: "Entity for the upper value",
		min: "Lowest value on the slider",
		max: "Highest value on the slider",
		step: "Step",
		unit: "Unit",
		show: "Values to show",
		position: "Where to show the values",
		small: "Small text for the values",
		push_handles: "Push the other handle",
		helper_entity_min: "The left handle changes this entity.",
		helper_entity_max: "The right handle changes this entity.",
		helper_min: "Leave empty to use the entity's own minimum.",
		helper_max: "Leave empty to use the entity's own maximum.",
		helper_step: "Leave empty to use the entity's own step.",
		helper_unit: "Leave empty to use the entity's own unit.",
		helper_position: "Below puts each value under its end of the slider.",
		helper_small: "Shows the values in smaller text.",
		helper_push_handles: "When off, a handle stops at the other handle.",
		both: "Both values (default)",
		lower: "Lower value",
		upper: "Upper value",
		none: "No value",
		right: "Right of the slider (default)",
		below: "Below the slider",
		bad_range: "The lowest value on the slider must be below the highest value.",
	},
	da: {
		entity_min: "Entitet for den nedre værdi",
		entity_max: "Entitet for den øvre værdi",
		min: "Laveste værdi på skyderen",
		max: "Højeste værdi på skyderen",
		step: "Trin",
		unit: "Enhed",
		show: "Viste værdier",
		position: "Hvor værdierne vises",
		small: "Lille tekst til værdierne",
		push_handles: "Skub det andet håndtag",
		helper_entity_min: "Det venstre håndtag ændrer denne entitet.",
		helper_entity_max: "Det højre håndtag ændrer denne entitet.",
		helper_min: "Lad feltet stå tomt for at bruge entitetens eget minimum.",
		helper_max: "Lad feltet stå tomt for at bruge entitetens eget maksimum.",
		helper_step: "Lad feltet stå tomt for at bruge entitetens eget trin.",
		helper_unit: "Lad feltet stå tomt for at bruge entitetens egen enhed.",
		helper_position: "Under viser hver værdi under sin ende af skyderen.",
		helper_small: "Viser værdierne med mindre tekst.",
		helper_push_handles: "Når den er slået fra, stopper et håndtag ved det andet.",
		both: "Begge værdier (standard)",
		lower: "Nedre værdi",
		upper: "Øvre værdi",
		none: "Ingen værdi",
		right: "Til højre for skyderen (standard)",
		below: "Under skyderen",
		bad_range: "Den laveste værdi på skyderen skal være under den højeste værdi.",
	},
};

// Home Assistant's number row styles (hui-input-number-entity-row), with the
// few additions a range needs marked as such.
const ROW_STYLES = `
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
	/* Added: without a value on the right, the slider also takes those 45 px,
	   so it starts where the slider of a number row starts. */
	.full .slider {
		min-width: calc(100px + 45px);
		max-width: calc(200px + 45px);
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
		margin-top: var(--ha-space-2);
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

const CARD_STYLES = `
	:host {
		display: block;
	}
	ha-card {
		height: 100%;
	}
`;

// The editor has no hass object, but Home Assistant sets the page language.
const texts = (language = document.documentElement.lang) => (language?.startsWith("da") ? TEXTS.da : TEXTS.en);

const given = (value) => value !== undefined && value !== null && value !== "";

const decimalsOf = (number) => (String(number).split(".")[1] ?? "").length;

const showValue = (setting) => {
	if (setting === false) {
		return "none";
	}
	if (setting === true || !given(setting)) {
		return "both";
	}
	return setting;
};

const checkConfig = (config) => {
	if (!config?.entity_min || !config?.entity_max) {
		throw new Error("Set both entity_min and entity_max.");
	}
	if (config.entity_min === config.entity_max) {
		throw new Error("entity_min and entity_max must be two different entities.");
	}
	for (const key of ["entity_min", "entity_max"]) {
		if (!DOMAINS.includes(String(config[key]).split(".")[0])) {
			throw new Error(`${key} must be an input_number or number entity.`);
		}
	}
	for (const key of ["min", "max", "step"]) {
		if (given(config[key]) && !Number.isFinite(Number(config[key]))) {
			throw new Error(`${key} must be a number.`);
		}
	}
	if (given(config.min) && given(config.max) && Number(config.min) >= Number(config.max)) {
		throw new Error("min must be below max.");
	}
	if (given(config.step) && Number(config.step) <= 0) {
		throw new Error("step must be above 0.");
	}
	if (typeof config.show !== "boolean" && given(config.show) && !SHOW_VALUE.includes(config.show)) {
		throw new Error(`show must be one of: ${SHOW_VALUE.join(", ")}.`);
	}
	if (given(config.position) && !VALUE_POSITIONS.includes(config.position)) {
		throw new Error(`position must be one of: ${VALUE_POSITIONS.join(", ")}.`);
	}
	for (const key of ["push_handles", "small"]) {
		if (given(config[key]) && typeof config[key] !== "boolean") {
			throw new Error(`${key} must be true or false.`);
		}
	}
};

// Finds the other entity of a pair like input_number.heating_low and
// input_number.heating_high.
const findPair = (hass, entityId) => {
	const [domain, objectId] = entityId.split(".");
	if (!DOMAINS.includes(domain) || !objectId) {
		return null;
	}
	const words = objectId.split("_");
	for (const [lowWord, highWord] of PAIR_WORDS) {
		for (const [from, to, isLower] of [
			[lowWord, highWord, true],
			[highWord, lowWord, false],
		]) {
			const index = words.indexOf(from);
			if (index === -1) {
				continue;
			}
			const other = `${domain}.${[...words.slice(0, index), to, ...words.slice(index + 1)].join("_")}`;
			if (hass.states[other]) {
				return isLower ? { entity_min: entityId, entity_max: other } : { entity_min: other, entity_max: entityId };
			}
		}
	}
	return null;
};

// Outer limits, step and unit: from the card settings, else from the entities.
const rangeOf = (config, lower, upper) => ({
	min: Number(given(config.min) ? config.min : lower.attributes.min ?? 0),
	max: Number(given(config.max) ? config.max : upper.attributes.max ?? 100),
	step: Number(given(config.step) ? config.step : lower.attributes.step ?? upper.attributes.step ?? 1),
	unit: given(config.unit)
		? String(config.unit)
		: lower.attributes.unit_of_measurement || upper.attributes.unit_of_measurement || "",
});

// Same locale choice as Home Assistant's own number formatting.
const numberLocale = (locale) => {
	switch (locale?.number_format) {
		case "comma_decimal":
			return ["en-US", "en"];
		case "decimal_comma":
			return ["de", "es", "it"];
		case "space_comma":
			return ["fr", "sv", "cs"];
		case "system":
			return undefined;
		case "none":
			return "en-US";
		default:
			return locale?.language;
	}
};

// Formats a value the way Home Assistant formats a number entity's state,
// but with at least the decimals of the step, so both values match.
const formatValue = (hass, stateObj, step) => {
	const value = Number(stateObj.state);
	const precision = hass.entities?.[stateObj.entity_id]?.display_precision;
	let decimals;
	if (precision != null) {
		decimals = precision;
	} else if (Number.isInteger(step) && Number.isInteger(value)) {
		decimals = 0;
	} else {
		decimals = Math.max(decimalsOf(stateObj.state), decimalsOf(step));
	}
	return new Intl.NumberFormat(numberLocale(hass.locale), {
		minimumFractionDigits: decimals,
		maximumFractionDigits: decimals,
		useGrouping: hass.locale?.number_format !== "none",
	}).format(value);
};

// Same spacing before the unit as Home Assistant uses.
const unitSpace = (unit, locale) => {
	if (unit === "°") {
		return "";
	}
	if (unit === "%") {
		return ["cs", "de", "fi", "fr", "sk", "sv"].includes(locale?.language) ? " " : "";
	}
	return " ";
};

const withUnit = (text, unit, locale) => (unit ? `${text}${unitSpace(unit, locale)}${unit}` : text);

// Puts the text in the element, wrapped in <small> when asked for.
const setText = (element, text, small) => {
	if (small && text) {
		const smallText = document.createElement("small");
		smallText.textContent = text;
		element.replaceChildren(smallText);
	} else {
		element.textContent = text;
	}
};

// Default name: the words both entity names share, for example
// "Heating low" and "Heating high" give "Heating".
const commonName = (hass, lower, upper) => {
	const nameOf = (stateObj) =>
		hass.formatEntityName?.(stateObj) || stateObj.attributes.friendly_name || stateObj.entity_id;
	const first = nameOf(lower).split(" ");
	const second = nameOf(upper).split(" ");
	let start = 0;
	while (start < first.length && start < second.length && first[start] === second[start]) {
		start++;
	}
	if (start) {
		return first.slice(0, start).join(" ");
	}
	let end = 0;
	while (
		end < first.length &&
		end < second.length &&
		first[first.length - 1 - end] === second[second.length - 1 - end]
	) {
		end++;
	}
	if (end) {
		const words = first.slice(first.length - end).join(" ");
		return words.charAt(0).toUpperCase() + words.slice(1);
	}
	return nameOf(lower);
};

// Home Assistant loads its slider and entity row only when a dashboard needs
// them. Creating a number row that is never shown makes it load both.
let haElementsLoaded;
const loadHaElements = () => {
	haElementsLoaded ??= (async () => {
		const tags = ["ha-slider", "hui-generic-entity-row", "hui-warning"];
		if (tags.every((tag) => customElements.get(tag))) {
			return;
		}
		const helpers = await window.loadCardHelpers?.();
		helpers?.createRowElement({ type: "input-number-entity" });
		await Promise.all(tags.map((tag) => customElements.whenDefined(tag)));
	})();
	return haElementsLoaded;
};

const findAccessor = (object, key) => {
	for (let proto = Object.getPrototypeOf(object); proto; proto = Object.getPrototypeOf(proto)) {
		const descriptor = Object.getOwnPropertyDescriptor(proto, key);
		if (descriptor) {
			return descriptor;
		}
	}
	return undefined;
};

// Home Assistant's slider pushes the other handle along when one handle
// reaches it. Unless push_handles is on, the handle stops there instead, like
// the heat and cool handles of Home Assistant's thermostat card. When both
// handles sit on the same spot, the drag direction picks the handle.
const stopAtOtherHandle = (slider, row) => {
	const accessors = {
		minValue: findAccessor(slider, "minValue"),
		maxValue: findAccessor(slider, "maxValue"),
	};
	if (!accessors.minValue?.set || !accessors.maxValue?.set) {
		return;
	}
	let startedTogether = false;
	slider.addEventListener(
		"pointerdown",
		() => {
			startedTogether = slider.minValue === slider.maxValue;
		},
		{ capture: true },
	);
	slider.addEventListener(
		"keydown",
		() => {
			startedTogether = false;
		},
		{ capture: true },
	);

	// Moves the handle picked above, also when the slider started dragging the other one.
	const setThumbValue = slider.setThumbValueFromCoordinates;
	if (typeof setThumbValue === "function") {
		slider.setThumbValueFromCoordinates = function (x, y, thumb) {
			return setThumbValue.call(this, x, y, this.activeThumb || thumb);
		};
	}

	for (const [key, thumb] of [
		["minValue", "min"],
		["maxValue", "max"],
	]) {
		const { get, set } = accessors[key];
		Object.defineProperty(slider, key, {
			configurable: true,
			get() {
				return get.call(this);
			},
			set(value) {
				const moving = this.activeThumb;
				if (row._settingValues || row._config?.push_handles || !moving) {
					set.call(this, value);
					return;
				}
				if (moving !== thumb) {
					// The slider tries to push this handle along.
					if (startedTogether && this.minValue === this.maxValue && value !== get.call(this)) {
						startedTogether = false;
						this.activeThumb = thumb;
						// Makes the slider report the change when the drag ends.
						this.valueWhenDraggingStarted = NaN;
						set.call(this, value);
						this.showRangeTooltips?.();
					}
					return;
				}
				const stopped = thumb === "min" ? Math.min(value, this.maxValue) : Math.max(value, this.minValue);
				if (stopped !== get.call(this)) {
					// The handle really moved, so the drag direction is chosen.
					startedTogether = false;
				}
				set.call(this, stopped);
			},
		});
	}
};

class EntityRangeSliderRow extends HTMLElement {
	_shown = {};

	setConfig(config) {
		checkConfig(config);
		this._config = config;
		this._update();
	}

	set hass(hass) {
		this._hass = hass;
		this._update();
	}

	connectedCallback() {
		this._resizeObserver ??= new ResizeObserver(() => this._fitValue());
		this._resizeObserver.observe(this);
	}

	disconnectedCallback() {
		this._resizeObserver?.disconnect();
	}

	async _build() {
		if (this._building) {
			return;
		}
		this._building = true;
		await loadHaElements();

		const style = document.createElement("style");
		style.textContent = ROW_STYLES;
		this._warning = document.createElement("hui-warning");
		this._warning.hidden = true;
		this._row = document.createElement("hui-generic-entity-row");
		this._row.catchInteraction = false;
		this._slider = document.createElement("ha-slider");
		this._slider.range = true;
		stopAtOtherHandle(this._slider, this);
		this._slider.addEventListener("change", () => this._changed());
		// Updates from Home Assistant must not move a handle while it is dragged.
		const dragEnd = () => {
			this._dragging = false;
			window.removeEventListener("pointerup", dragEnd, true);
			window.removeEventListener("pointercancel", dragEnd, true);
		};
		this._slider.addEventListener(
			"pointerdown",
			() => {
				this._dragging = true;
				window.addEventListener("pointerup", dragEnd, true);
				window.addEventListener("pointercancel", dragEnd, true);
			},
			{ capture: true },
		);
		this._lowerText = document.createElement("span");
		this._upperText = document.createElement("span");
		this._below = document.createElement("div");
		this._below.className = "below";
		this._below.append(this._lowerText, this._upperText);
		const sliderBox = document.createElement("div");
		sliderBox.className = "slider";
		sliderBox.append(this._slider, this._below);
		this._valueText = document.createElement("span");
		this._valueText.className = "state";
		this._flex = document.createElement("div");
		this._flex.className = "flex";
		this._flex.append(sliderBox, this._valueText);
		this._row.append(this._flex);
		this.attachShadow({ mode: "open" }).append(style, this._warning, this._row);

		this._built = true;
		this._update();
	}

	_update() {
		const config = this._config;
		const hass = this._hass;
		if (!config || !hass) {
			return;
		}
		if (!this._built) {
			this._build();
			return;
		}
		if (this._dragging) {
			// The next update after the drag shows everything.
			return;
		}
		const lower = hass.states[config.entity_min];
		const upper = hass.states[config.entity_max];
		// Like Home Assistant's own rows: only redraw when one of the two
		// entities, the settings or the language changed.
		const shown = this._shown;
		if (
			shown.config === config &&
			shown.lower === lower &&
			shown.upper === upper &&
			shown.locale === hass.locale
		) {
			return;
		}
		this._shown = { config, lower, upper, locale: hass.locale };

		const missing = [config.entity_min, config.entity_max].find((entityId) => !hass.states[entityId]);
		if (missing) {
			this._showWarning(
				hass.config.state === "NOT_RUNNING"
					? hass.localize("ui.panel.lovelace.warning.starting")
					: `${hass.localize("ui.card.common.entity_not_found") || "Entity not found"}: ${missing}`,
			);
			return;
		}
		const range = rangeOf(config, lower, upper);
		if (!(range.min < range.max)) {
			this._showWarning(texts(hass.locale?.language ?? hass.language).bad_range);
			return;
		}
		this._warning.hidden = true;
		this._row.hidden = false;
		this._range = range;

		const noValue = [lower, upper].some((stateObj) => NO_VALUE_STATES.includes(stateObj.state));
		const slider = this._slider;
		slider.min = range.min;
		slider.max = range.max;
		slider.step = range.step;
		slider.disabled = noValue;
		if (!noValue) {
			this._settingValues = true;
			slider.minValue = Number(lower.state);
			slider.maxValue = Number(upper.state);
			this._settingValues = false;
		}

		this._row.hass = hass;
		this._row.config = {
			...config,
			entity: config.entity_min,
			name: config.name || commonName(hass, lower, upper),
		};
		const show = showValue(config.show);
		const below = config.position === "below";
		const small = config.small === true;
		setText(this._valueText, below ? "" : this._valueString(lower, upper, range), small);
		setText(this._lowerText, below && ["both", "lower"].includes(show) ? this._oneValue(lower, range) : "", small);
		setText(this._upperText, below && ["both", "upper"].includes(show) ? this._oneValue(upper, range) : "", small);
		this._below.hidden = !below || show === "none";
		this._fitValue();
	}

	_showWarning(text) {
		this._row.hidden = true;
		this._warning.hass = this._hass;
		this._warning.textContent = text;
		this._warning.hidden = false;
	}

	_valueString(lower, upper, range) {
		const shown = {
			both: [lower, upper],
			lower: [lower],
			upper: [upper],
			none: [],
		}[showValue(this._config.show)];
		if (!shown.length) {
			return "";
		}
		const hass = this._hass;
		const noValue = shown.find((stateObj) => NO_VALUE_STATES.includes(stateObj.state));
		if (noValue) {
			return hass.formatEntityState(noValue);
		}
		const numbers = shown.map((stateObj) => formatValue(hass, stateObj, range.step)).join(" - ");
		return withUnit(numbers, range.unit, hass.locale);
	}

	_oneValue(stateObj, range) {
		const hass = this._hass;
		return NO_VALUE_STATES.includes(stateObj.state)
			? hass.formatEntityState(stateObj)
			: withUnit(formatValue(hass, stateObj, range.step), range.unit, hass.locale);
	}

	// Like Home Assistant's number row: no value text right of the slider on
	// very narrow rows.
	_fitValue() {
		if (!this._valueText || !this._config) {
			return;
		}
		const narrow = this.clientWidth <= 300;
		const valueRight =
			!narrow && this._config.position !== "below" && showValue(this._config.show) !== "none";
		this._valueText.hidden = !valueRight;
		this._flex.classList.toggle("full", !narrow && !valueRight);
	}

	async _changed() {
		const hass = this._hass;
		const config = this._config;
		const decimals = Math.max(decimalsOf(this._range.step), decimalsOf(this._range.min));
		const round = (value) => Number(Number(value).toFixed(decimals));
		const lowerNow = Number(hass.states[config.entity_min]?.state);
		const upperNow = Number(hass.states[config.entity_max]?.state);
		const lower = round(this._slider.minValue);
		const upper = round(this._slider.maxValue);
		const writes = [];
		if (lower !== lowerNow) {
			writes.push([config.entity_min, lower]);
		}
		if (upper !== upperNow) {
			writes.push([config.entity_max, upper]);
		}
		// When both values go up, save the upper one first, so the lower value
		// is never above the upper value, not even for a moment.
		if (writes.length === 2 && upper > upperNow) {
			writes.reverse();
		}
		try {
			for (const [entityId, value] of writes) {
				await hass.callService(entityId.split(".")[0], "set_value", { value }, { entity_id: entityId });
			}
		} catch (err) {
			// Home Assistant has already shown the error. Put the handles back.
			this._shown = {};
			this._update();
		}
	}
}

class EntityRangeSliderCard extends HTMLElement {
	static getConfigForm() {
		const text = texts();
		const numberEntity = { entity: { filter: { domain: DOMAINS } } };
		return {
			schema: [
				{ name: "entity_min", required: true, selector: numberEntity },
				{ name: "entity_max", required: true, selector: numberEntity },
				{ name: "name", selector: { entity_name: {} }, context: { entity: "entity_min" } },
				{ name: "icon", selector: { icon: {} }, context: { icon_entity: "entity_min" } },
				{
					name: "",
					type: "grid",
					schema: [
						{ name: "min", selector: { number: { mode: "box", step: "any" } } },
						{ name: "max", selector: { number: { mode: "box", step: "any" } } },
						{ name: "step", selector: { number: { mode: "box", step: "any", min: 0 } } },
						{ name: "unit", selector: { text: {} } },
					],
				},
				{
					name: "show",
					selector: {
						select: {
							mode: "dropdown",
							options: SHOW_VALUE.map((value) => ({ value, label: text[value] })),
						},
					},
				},
				{
					name: "position",
					selector: {
						select: {
							mode: "dropdown",
							options: VALUE_POSITIONS.map((value) => ({ value, label: text[value] })),
						},
					},
				},
				{ name: "small", selector: { boolean: {} } },
				{ name: "push_handles", selector: { boolean: {} } },
			],
			computeLabel: (schema) => text[schema.name],
			computeHelper: (schema) => text[`helper_${schema.name}`],
		};
	}

	static getStubConfig(hass) {
		const numbers = Object.keys(hass.states).filter((entityId) => DOMAINS.includes(entityId.split(".")[0]));
		for (const entityId of numbers) {
			const pair = findPair(hass, entityId);
			if (pair) {
				return pair;
			}
		}
		return { entity_min: numbers[0] ?? "", entity_max: numbers[1] ?? "" };
	}

	setConfig(config) {
		checkConfig(config);
		if (!this._row) {
			const style = document.createElement("style");
			style.textContent = CARD_STYLES;
			const card = document.createElement("ha-card");
			const content = document.createElement("div");
			content.className = "card-content";
			this._row = document.createElement(ROW_TAG);
			content.append(this._row);
			card.append(content);
			this.attachShadow({ mode: "open" }).append(style, card);
		}
		this._row.setConfig(config);
	}

	set hass(hass) {
		this._row.hass = hass;
	}

	getCardSize() {
		return 1;
	}

	getGridOptions() {
		return { columns: 12, min_columns: 6 };
	}
}

if (!customElements.get(ROW_TAG)) {
	customElements.define(ROW_TAG, EntityRangeSliderRow);
}
if (!customElements.get(CARD_TAG)) {
	customElements.define(CARD_TAG, EntityRangeSliderCard);
}

window.customCards = window.customCards || [];
if (!window.customCards.some((card) => card.type === CARD_TAG)) {
	window.customCards.push({
		type: CARD_TAG,
		name: "Entity range slider",
		description: "A slider with two handles that sets a lower and an upper number entity.",
		preview: true,
		documentationURL: "https://github.com/mm98/ha-entity-range-slider",
		getEntitySuggestion: (hass, entityId) => {
			const pair = findPair(hass, entityId);
			return pair ? { config: { type: `custom:${CARD_TAG}`, ...pair } } : null;
		},
	});
}

console.info(`entity-range-slider ${VERSION}`);
