/*
 * Entity range slider for Home Assistant dashboards.
 *
 * One slider with two handles. The left handle sets entity_min, the right
 * handle sets entity_max. Both hold numbers, times, dates or dates with times.
 * It uses Home Assistant's own slider and entity row, so it looks like the
 * built-in number slider and follows the theme.
 */

const VERSION = "0.4.0";
const CARD_TAG = "entity-range-slider";
const ROW_TAG = "entity-range-slider-row";
const EDITOR_TAG = "entity-range-slider-editor";
const NUMBER_DOMAINS = ["input_number", "number"];
const DOMAINS = [...NUMBER_DOMAINS, "input_datetime", "time", "date", "datetime"];
const NO_VALUE_STATES = ["unavailable", "unknown"];
const SHOW_VALUE = ["both", "lower", "upper", "none"];
const VALUE_POSITIONS = ["right", "below"];
const MINUTE = 60000;
const DAY = 86400000;

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
		full_width: "Full width slider",
		small: "Small text for the values",
		push: "Push the other handle",
		helper_entity_min: "The left handle changes this entity.",
		helper_entity_max: "The right handle changes this entity.",
		helper_min: "Leave empty for the default. Times like 06:00, dates like 2026-10-01 or +7d.",
		helper_max: "Leave empty for the default. Times like 22:00, dates like 2026-12-31 or +30d.",
		helper_step: "Leave empty for the default. For times in minutes, for dates in days.",
		helper_unit: "For numbers. Leave empty to use the entity's own unit.",
		helper_position: "By default numbers show right, dates and times below.",
		helper_full_width: "The slider also uses the space on the right. Values on the right move below the slider.",
		helper_small: "Shows the values in smaller text.",
		helper_push: "When off, a handle stops at the other handle.",
		both: "Both values (default)",
		lower: "Lower value",
		upper: "Upper value",
		none: "No value",
		right: "Right of the slider",
		below: "Below the slider",
		bad_range: "The lowest value on the slider must be below the highest value.",
		bad_limit: "The lowest or highest value on the slider is not a valid date or time.",
		mixed_kinds: "Both entities must hold the same kind of value: numbers, times, dates or dates with times.",
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
		full_width: "Skyder i fuld bredde",
		small: "Lille tekst til værdierne",
		push: "Skub det andet håndtag",
		helper_entity_min: "Det venstre håndtag ændrer denne entitet.",
		helper_entity_max: "Det højre håndtag ændrer denne entitet.",
		helper_min: "Lad feltet stå tomt for standard. Tider som 06:00, datoer som 2026-10-01 eller +7d.",
		helper_max: "Lad feltet stå tomt for standard. Tider som 22:00, datoer som 2026-12-31 eller +30d.",
		helper_step: "Lad feltet stå tomt for standard. For tider i minutter, for datoer i dage.",
		helper_unit: "Til tal. Lad feltet stå tomt for at bruge entitetens egen enhed.",
		helper_position: "Som standard vises tal til højre, datoer og tider under.",
		helper_full_width: "Skyderen bruger også pladsen til højre. Værdier til højre flyttes ned under skyderen.",
		helper_small: "Viser værdierne med mindre tekst.",
		helper_push: "Når den er slået fra, stopper et håndtag ved det andet.",
		both: "Begge værdier (standard)",
		lower: "Nedre værdi",
		upper: "Øvre værdi",
		none: "Ingen værdi",
		right: "Til højre for skyderen",
		below: "Under skyderen",
		bad_range: "Den laveste værdi på skyderen skal være under den højeste værdi.",
		bad_limit: "Den laveste eller højeste værdi på skyderen er ikke en gyldig dato eller tid.",
		mixed_kinds: "Begge entiteter skal have samme slags værdi: tal, tider, datoer eller datoer med tid.",
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

const domainOf = (entityId) => String(entityId).split(".")[0];

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
	const domains = [domainOf(config.entity_min), domainOf(config.entity_max)];
	for (const [index, key] of ["entity_min", "entity_max"].entries()) {
		if (!DOMAINS.includes(domains[index])) {
			throw new Error(`${key} must be one of these entity types: ${DOMAINS.join(", ")}.`);
		}
	}
	const numbers = domains.map((domain) => NUMBER_DOMAINS.includes(domain));
	if (numbers[0] !== numbers[1]) {
		throw new Error("entity_min and entity_max must both be numbers, or both dates or times.");
	}
	if (numbers[0]) {
		for (const key of ["min", "max"]) {
			if (given(config[key]) && !Number.isFinite(Number(config[key]))) {
				throw new Error(`${key} must be a number.`);
			}
		}
		if (given(config.min) && given(config.max) && Number(config.min) >= Number(config.max)) {
			throw new Error("min must be below max.");
		}
	}
	if (given(config.step) && !(Number(config.step) > 0)) {
		throw new Error("step must be a number above 0.");
	}
	if (typeof config.show !== "boolean" && given(config.show) && !SHOW_VALUE.includes(config.show)) {
		throw new Error(`show must be one of: ${SHOW_VALUE.join(", ")}.`);
	}
	if (given(config.position) && !VALUE_POSITIONS.includes(config.position)) {
		throw new Error(`position must be one of: ${VALUE_POSITIONS.join(", ")}.`);
	}
	for (const key of ["full_width", "push", "small"]) {
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

// The kind of value an entity holds: number, time, date or datetime (a date
// with a time).
const kindOf = (stateObj) => {
	const domain = domainOf(stateObj.entity_id);
	if (NUMBER_DOMAINS.includes(domain)) {
		return "number";
	}
	if (domain === "input_datetime") {
		const { has_date: hasDate, has_time: hasTime } = stateObj.attributes;
		if (hasDate && hasTime) {
			return "datetime";
		}
		return hasDate ? "date" : "time";
	}
	return domain;
};

/*
 * Times and dates on the slider.
 *
 * The slider only knows numbers, so a time is its minute of the day, a date
 * its day number and a date with a time its minute number. Clock times are
 * kept as milliseconds whose UTC digits are the wall clock digits, so no time
 * zone can shift them. Like Home Assistant, input_datetime values are wall
 * clock values as they are, and datetime entities (moments in time) are shown
 * in the time zone the user profile picks.
 */

// Like Home Assistant: the browser's time zone when the user profile asks
// for it, else the server's.
const timeZoneOf = (hass) =>
	(hass.locale?.time_zone === "local" && Intl.DateTimeFormat().resolvedOptions().timeZone) || hass.config.time_zone;

// The wall clock time of a moment in a time zone.
const wallClock = (utcMs, timeZone) => {
	const parts = Object.fromEntries(
		new Intl.DateTimeFormat("en-US", {
			timeZone,
			hourCycle: "h23",
			year: "numeric",
			month: "numeric",
			day: "numeric",
			hour: "numeric",
			minute: "numeric",
			second: "numeric",
		})
			.formatToParts(new Date(utcMs))
			.map((part) => [part.type, Number(part.value)]),
	);
	return Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second);
};

// The moment a wall clock time happens in a time zone.
const fromWallClock = (wallMs, timeZone) => {
	let utcMs = wallMs;
	for (let round = 0; round < 2; round++) {
		utcMs = wallMs - (wallClock(utcMs, timeZone) - utcMs);
	}
	return utcMs;
};

const todayStart = (hass) => {
	const now = wallClock(Date.now(), timeZoneOf(hass));
	return now - (now % DAY);
};

// "2026-10-01", "2026-10-01 18:30:00" or "2026-10-01T18:30:00.000Z" as a
// wall clock time.
const parseWallClock = (text) => {
	const match = String(text).match(/^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2})(?::(\d{2}))?)?/);
	if (!match) {
		return NaN;
	}
	const [year, month, day, hour, minute, second] = match.slice(1).map((part) => Number(part ?? 0));
	return Date.UTC(year, month - 1, day, hour, minute, second);
};

// "18:30" or "18:30:00" as the minute of the day.
const parseTime = (text) => {
	const match = String(text)
		.trim()
		.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
	return match ? Number(match[1]) * 60 + Number(match[2]) : NaN;
};

const isoDate = (wallMs) => new Date(wallMs).toISOString().slice(0, 10);
const isoTime = (wallMs) => new Date(wallMs).toISOString().slice(11, 19);

// A limit from the card settings. Dates can also be relative to today:
// today, +30d or -7d.
const parseLimit = (kind, setting, hass) => {
	if (kind === "time") {
		return parseTime(setting);
	}
	const text = setting instanceof Date ? setting.toISOString() : String(setting).trim();
	const days = text === "today" ? 0 : text.match(/^([+-]\d+)d$/)?.[1];
	const wallMs = days === undefined ? parseWallClock(text) : todayStart(hass) + Number(days) * DAY;
	return kind === "date" ? Math.floor(wallMs / DAY) : Math.round(wallMs / MINUTE);
};

// The value of an entity on the slider.
const valueOf = (kind, stateObj, hass) => {
	switch (kind) {
		case "number":
			return Number(stateObj.state);
		case "time":
			return parseTime(stateObj.state);
		case "date":
			return parseWallClock(stateObj.state) / DAY;
		default:
			return domainOf(stateObj.entity_id) === "datetime"
				? Math.round(wallClock(Date.parse(stateObj.state), timeZoneOf(hass)) / MINUTE)
				: Math.round(parseWallClock(stateObj.state) / MINUTE);
	}
};

// Saves a slider value with the entity's own action.
const saveValue = (hass, kind, entityId, value) => {
	const domain = domainOf(entityId);
	const target = { entity_id: entityId };
	if (kind === "number") {
		return hass.callService(domain, "set_value", { value }, target);
	}
	if (kind === "time") {
		const time = isoTime(value * MINUTE);
		return domain === "input_datetime"
			? hass.callService(domain, "set_datetime", { time }, target)
			: hass.callService(domain, "set_value", { time }, target);
	}
	if (kind === "date") {
		const date = isoDate(value * DAY);
		return domain === "input_datetime"
			? hass.callService(domain, "set_datetime", { date }, target)
			: hass.callService(domain, "set_value", { date }, target);
	}
	const wallMs = value * MINUTE;
	return domain === "input_datetime"
		? hass.callService(domain, "set_datetime", { datetime: `${isoDate(wallMs)} ${isoTime(wallMs)}` }, target)
		: hass.callService(domain, "set_value", { datetime: new Date(fromWallClock(wallMs, timeZoneOf(hass))).toISOString() }, target);
};

// Home Assistant's rule for 12-hour clocks (use_am_pm.ts).
const useAmPm = (locale) => {
	if (locale?.time_format === "12" || locale?.time_format === "24") {
		return locale.time_format === "12";
	}
	const language = locale?.time_format === "system" ? undefined : locale?.language;
	return new Date("January 1, 2023 22:00:00").toLocaleString(language).includes("10");
};

// Formats a time or date the way Home Assistant's short formats do
// (formatTime, formatDateVeryShort and formatShortDateTime, with the year
// only when it is not this year).
const formatClock = (kind, value, hass) => {
	const locale = hass.locale;
	const amPm = useAmPm(locale);
	if (kind === "time") {
		return new Intl.DateTimeFormat(locale?.language, {
			hour: "numeric",
			minute: "2-digit",
			hourCycle: amPm ? "h12" : "h23",
			timeZone: "UTC",
		}).format(new Date(value * MINUTE));
	}
	const wallMs = value * (kind === "date" ? DAY : MINUTE);
	const thisYear = new Date(todayStart(hass)).getUTCFullYear() === new Date(wallMs).getUTCFullYear();
	return new Intl.DateTimeFormat(locale?.language, {
		...(thisYear ? {} : { year: "numeric" }),
		month: "short",
		day: "numeric",
		...(kind === "datetime"
			? { hour: amPm ? "numeric" : "2-digit", minute: "2-digit", hourCycle: amPm ? "h12" : "h23" }
			: {}),
		timeZone: "UTC",
	}).format(new Date(wallMs));
};

// Outer limits, step and unit: from the card settings, else from the entities
// (numbers) or defaults (times: the whole day, dates: today and 30 days on).
const rangeOf = (config, lower, upper, kind, hass) => {
	if (kind === "number") {
		return {
			min: Number(given(config.min) ? config.min : lower.attributes.min ?? 0),
			max: Number(given(config.max) ? config.max : upper.attributes.max ?? 100),
			step: Number(given(config.step) ? config.step : lower.attributes.step ?? upper.attributes.step ?? 1),
			unit: given(config.unit)
				? String(config.unit)
				: lower.attributes.unit_of_measurement || upper.attributes.unit_of_measurement || "",
		};
	}
	const today = todayStart(hass);
	const [min, max, step] = {
		time: [0, 24 * 60 - 1, 15],
		date: [today / DAY, today / DAY + 30, 1],
		datetime: [today / MINUTE, (today + 30 * DAY) / MINUTE, 60],
	}[kind];
	return {
		min: given(config.min) ? parseLimit(kind, config.min, hass) : min,
		max: given(config.max) ? parseLimit(kind, config.max, hass) : max,
		step: given(config.step) ? Number(config.step) : step,
		unit: "",
	};
};

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
// reaches it. Unless push is on, the handle stops there instead, like
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
				if (row._settingValues || row._config?.push || !moving) {
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

// The fields of the visual editor, for the card and the row.
const configForm = () => {
	const text = texts();
	const rangeEntity = { entity: { filter: { domain: DOMAINS } } };
	return {
		schema: [
			{ name: "entity_min", required: true, selector: rangeEntity },
			{ name: "entity_max", required: true, selector: rangeEntity },
			{ name: "name", selector: { entity_name: {} }, context: { entity: "entity_min" } },
			{ name: "icon", selector: { icon: {} }, context: { icon_entity: "entity_min" } },
			{
				name: "",
				type: "grid",
				schema: [
					{ name: "min", selector: { text: {} } },
					{ name: "max", selector: { text: {} } },
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
			{ name: "full_width", selector: { boolean: {} } },
			{ name: "small", selector: { boolean: {} } },
			{ name: "push", selector: { boolean: {} } },
		],
		computeLabel: (schema) => text[schema.name],
		computeHelper: (schema) => text[`helper_${schema.name}`],
	};
};

// Home Assistant shows the form above for cards (getConfigForm), but rows in
// an entities card need an editor element of their own. This one shows the
// same form with Home Assistant's ha-form, like its form editor for cards.
class EntityRangeSliderEditor extends HTMLElement {
	setConfig(config) {
		this._config = config;
		this._render();
	}

	set hass(hass) {
		this._hass = hass;
		this._render();
	}

	_render() {
		if (!this._config || !this._hass) {
			return;
		}
		if (!this._form) {
			const form = configForm();
			this._form = document.createElement("ha-form");
			this._form.schema = form.schema;
			// Like Home Assistant's form editor: its own translated labels for
			// generic fields like name and icon.
			this._form.computeLabel = (schema) =>
				form.computeLabel(schema) || this._hass.localize(`ui.panel.lovelace.editor.card.generic.${schema.name}`);
			this._form.computeHelper = form.computeHelper;
			this._form.addEventListener("value-changed", (event) => {
				event.stopPropagation();
				this.dispatchEvent(
					new CustomEvent("config-changed", { detail: { config: event.detail.value }, bubbles: true, composed: true }),
				);
			});
			this.append(this._form);
		}
		this._form.hass = this._hass;
		this._form.data = this._config;
	}
}

class EntityRangeSliderRow extends HTMLElement {
	_shown = {};

	static getConfigElement() {
		return document.createElement(EDITOR_TAG);
	}

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
		this._numberFormatter = this._slider.valueFormatter;
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
		// Like Home Assistant's own rows (has-changed.ts): only redraw when the
		// settings, one of the two entities or the way things are shown changed.
		// The formatters arrive a moment after the first hass object.
		const old = this._shown.hass;
		const changed =
			this._shown.config !== config ||
			!old ||
			[
				"connected",
				"themes",
				"locale",
				"localize",
				"formatEntityState",
				"formatEntityAttributeName",
				"formatEntityAttributeValue",
				"formatEntityName",
			].some((key) => old[key] !== hass[key]) ||
			old.config?.state !== hass.config?.state ||
			[config.entity_min, config.entity_max].some(
				(entityId) => old.states[entityId] !== hass.states[entityId] || old.entities?.[entityId] !== hass.entities?.[entityId],
			);
		if (!changed) {
			return;
		}
		this._shown = { config, hass };
		const text = texts(hass.locale?.language ?? hass.language);

		const missing = [config.entity_min, config.entity_max].find((entityId) => !hass.states[entityId]);
		if (missing) {
			this._showWarning(
				hass.config.state === "NOT_RUNNING"
					? hass.localize("ui.panel.lovelace.warning.starting")
					: `${hass.localize("ui.card.common.entity_not_found") || "Entity not found"}: ${missing}`,
			);
			return;
		}
		const kind = kindOf(lower);
		if (kindOf(upper) !== kind) {
			this._showWarning(text.mixed_kinds);
			return;
		}
		const range = rangeOf(config, lower, upper, kind, hass);
		if (!Number.isFinite(range.min) || !Number.isFinite(range.max)) {
			this._showWarning(text.bad_limit);
			return;
		}
		if (!(range.min < range.max)) {
			this._showWarning(text.bad_range);
			return;
		}
		this._warning.hidden = true;
		this._row.hidden = false;
		this._kind = kind;
		this._range = range;

		const values = [valueOf(kind, lower, hass), valueOf(kind, upper, hass)];
		const noValue =
			[lower, upper].some((stateObj) => NO_VALUE_STATES.includes(stateObj.state)) ||
			!values.every(Number.isFinite);
		const slider = this._slider;
		slider.min = range.min;
		slider.max = range.max;
		slider.step = range.step;
		slider.disabled = noValue;
		slider.valueFormatter =
			kind === "number" ? this._numberFormatter : (value) => formatClock(kind, value, this._hass);
		if (!noValue) {
			this._settingValues = true;
			[slider.minValue, slider.maxValue] = values;
			this._settingValues = false;
		}

		this._row.hass = hass;
		this._row.config = {
			...config,
			entity: config.entity_min,
			name: config.name || commonName(hass, lower, upper),
		};
		const show = showValue(config.show);
		const below = this._position() === "below";
		const small = config.small === true;
		setText(this._valueText, below ? "" : this._valueString(lower, upper, range), small);
		setText(this._lowerText, below && ["both", "lower"].includes(show) ? this._oneValue(lower, range) : "", small);
		setText(this._upperText, below && ["both", "upper"].includes(show) ? this._oneValue(upper, range) : "", small);
		this._below.hidden = !below || show === "none";
		this._fitValue();
	}

	// Numbers show their values right of the slider by default, like Home
	// Assistant's number slider. Dates and times are too long for that space.
	_position() {
		// A full width slider leaves no room on the right.
		if (this._config.full_width === true) {
			return "below";
		}
		return this._config.position || (this._kind === "number" || !this._kind ? "right" : "below");
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
		if (this._kind !== "number") {
			return shown.map((stateObj) => this._oneValue(stateObj, range)).join(" - ");
		}
		const numbers = shown.map((stateObj) => formatValue(hass, stateObj, range.step)).join(" - ");
		return withUnit(numbers, range.unit, hass.locale);
	}

	_oneValue(stateObj, range) {
		const hass = this._hass;
		if (NO_VALUE_STATES.includes(stateObj.state)) {
			return hass.formatEntityState(stateObj);
		}
		if (this._kind !== "number") {
			return formatClock(this._kind, valueOf(this._kind, stateObj, hass), hass);
		}
		return withUnit(formatValue(hass, stateObj, range.step), range.unit, hass.locale);
	}

	// Like Home Assistant's number row: no value text right of the slider on
	// very narrow rows. Otherwise the space for the value keeps its 45 px, also
	// when it is empty, so the slider has the size of Home Assistant's number
	// slider. Only full_width gives that space to the slider.
	_fitValue() {
		if (!this._valueText || !this._config) {
			return;
		}
		const narrow = this.clientWidth <= 300;
		const full = !narrow && this._config.full_width === true;
		this._valueText.hidden = narrow || full;
		this._flex.classList.toggle("full", full);
		this.toggleAttribute("full", full);
	}

	async _changed() {
		const hass = this._hass;
		const config = this._config;
		const kind = this._kind;
		const decimals = Math.max(decimalsOf(this._range.step), decimalsOf(this._range.min));
		const round =
			kind === "number" ? (value) => Number(Number(value).toFixed(decimals)) : (value) => Math.round(value);
		const lowerNow = valueOf(kind, hass.states[config.entity_min], hass);
		const upperNow = valueOf(kind, hass.states[config.entity_max], hass);
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
				await saveValue(hass, kind, entityId, value);
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
		return configForm();
	}

	static getStubConfig(hass) {
		const candidates = Object.keys(hass.states).filter((entityId) => DOMAINS.includes(domainOf(entityId)));
		for (const entityId of candidates) {
			const pair = findPair(hass, entityId);
			if (pair) {
				return pair;
			}
		}
		const numbers = candidates.filter((entityId) => NUMBER_DOMAINS.includes(domainOf(entityId)));
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
if (!customElements.get(EDITOR_TAG)) {
	customElements.define(EDITOR_TAG, EntityRangeSliderEditor);
}
if (!customElements.get(CARD_TAG)) {
	customElements.define(CARD_TAG, EntityRangeSliderCard);
}

window.customCards = window.customCards || [];
if (!window.customCards.some((card) => card.type === CARD_TAG)) {
	window.customCards.push({
		type: CARD_TAG,
		name: "Entity range slider",
		description: "A slider with two handles that sets a lower and an upper number, date or time entity.",
		preview: true,
		documentationURL: "https://github.com/mm98/ha-entity-range-slider",
		getEntitySuggestion: (hass, entityId) => {
			const pair = findPair(hass, entityId);
			return pair ? { config: { type: `custom:${CARD_TAG}`, ...pair } } : null;
		},
	});
}

console.info(`entity-range-slider ${VERSION}`);
