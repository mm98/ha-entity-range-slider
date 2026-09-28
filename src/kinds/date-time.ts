/*
 * Times, dates and dates with times: input_datetime, time, date and datetime
 * entities.
 *
 * The slider only knows numbers, so a time is its minute of the day, a date
 * its day number and a date with a time its minute number. Local times are
 * kept as milliseconds whose UTC digits are the local time digits, so no time
 * zone can shift them. Like Home Assistant, input_datetime values are local
 * times as they are, and datetime entities (moments in time) are shown in the
 * time zone the user profile picks.
 */

import { type EntityRangeSliderConfig, isSet } from "../config";
import { computeDomain, type FrontendLocaleData, type HassEntity, type HomeAssistant } from "../home-assistant";
import type { SliderRange, SliderRangeDefaults, ValueKind } from "./value-kind";

const MINUTE_MS = 60_000;
const DAY_MS = 86_400_000;

// src/common/datetime/resolve-time-zone.ts, without its check against the
// list of IANA time zone names.
const LOCAL_TIME_ZONE = Intl.DateTimeFormat?.().resolvedOptions?.().timeZone;

// src/common/datetime/resolve-time-zone.ts: the browser's time zone when the
// user profile asks for it, else the server's.
const resolveTimeZone = (option: FrontendLocaleData["time_zone"], serverTimeZone: string): string =>
	option === "local" && LOCAL_TIME_ZONE ? LOCAL_TIME_ZONE : serverTimeZone;

// The local time of a moment in a time zone.
const toLocalTime = (utcMs: number, timeZone: string): number => {
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

// The moment a local time happens in a time zone.
const fromLocalTime = (localMs: number, timeZone: string): number => {
	let utcMs = localMs;
	for (let round = 0; round < 2; round++) {
		utcMs = localMs - (toLocalTime(utcMs, timeZone) - utcMs);
	}
	return utcMs;
};

const todayStart = (hass: HomeAssistant): number => {
	const now = toLocalTime(Date.now(), resolveTimeZone(hass.locale.time_zone, hass.config.time_zone));
	return now - (now % DAY_MS);
};

// "2026-10-01", "2026-10-01 18:30:00" or "2026-10-01T18:30:00.000Z" as a local
// time.
const parseLocalDateTime = (text: string): number => {
	const match = String(text).match(/^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2})(?::(\d{2}))?)?/);
	if (!match) {
		return NaN;
	}
	const [year, month, day, hour, minute, second] = match.slice(1).map((part) => Number(part ?? 0));
	return Date.UTC(year, month - 1, day, hour, minute, second);
};

// "18:30" or "18:30:00" as the minute of the day.
const parseTime = (text: unknown): number => {
	const match = String(text)
		.trim()
		.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
	return match ? Number(match[1]) * 60 + Number(match[2]) : NaN;
};

// A date from the config as a local time. Dates can also be relative
// to today: today, +30d or -7d.
const parseDate = (setting: unknown, hass: HomeAssistant): number => {
	const text = setting instanceof Date ? setting.toISOString() : String(setting).trim();
	const days = text === "today" ? "0" : text.match(/^([+-]\d+)d$/)?.[1];
	return days === undefined ? parseLocalDateTime(text) : todayStart(hass) + Number(days) * DAY_MS;
};

const isoDate = (localMs: number): string => new Date(localMs).toISOString().slice(0, 10);
const isoTime = (localMs: number): string => new Date(localMs).toISOString().slice(11, 19);

// src/common/datetime/use_am_pm.ts, without memoizeOne.
const useAmPm = (locale: FrontendLocaleData): boolean => {
	if (locale.time_format === "language" || locale.time_format === "system") {
		const testLanguage = locale.time_format === "language" ? locale.language : undefined;
		const test = new Date("January 1, 2023 22:00:00").toLocaleString(testLanguage);
		return test.includes("10");
	}
	return locale.time_format === "12";
};

// src/common/datetime/format_time.ts (formatTime), for a minute of the day
// instead of a moment, so it formats in UTC and not in a time zone.
const formatTime = (minutes: number, hass: HomeAssistant): string => {
	const amPm = useAmPm(hass.locale);
	return new Intl.DateTimeFormat(hass.locale.language, {
		hour: "numeric",
		minute: "2-digit",
		hourCycle: amPm ? "h12" : "h23",
		timeZone: "UTC",
	}).format(new Date(minutes * MINUTE_MS));
};

// Home Assistant's formatDateVeryShort and formatShortDateTime, with the year
// only when it is not this year.
const formatDate = (localMs: number, withTime: boolean, hass: HomeAssistant): string => {
	const amPm = useAmPm(hass.locale);
	const thisYear = new Date(todayStart(hass)).getUTCFullYear() === new Date(localMs).getUTCFullYear();
	return new Intl.DateTimeFormat(hass.locale.language, {
		...(thisYear ? {} : { year: "numeric" }),
		month: "short",
		day: "numeric",
		...(withTime ? { hour: amPm ? "numeric" : "2-digit", minute: "2-digit", hourCycle: amPm ? "h12" : "h23" } : {}),
		timeZone: "UTC",
	}).format(new Date(localMs));
};

// Saves with the entity's own action: input_datetime.set_datetime, else
// time.set_value, date.set_value or datetime.set_value.
const saveDateTime = (
	hass: Pick<HomeAssistant, "callService">,
	entityId: string,
	data: Record<string, unknown>,
): Promise<unknown> => {
	const domain = computeDomain(entityId);
	const action = domain === "input_datetime" ? "set_datetime" : "set_value";
	return hass.callService(domain, action, data, { entity_id: entityId });
};

// Which kind an input_datetime holds follows its settings.
const isInputDatetime = (stateObj: HassEntity, hasDate: boolean, hasTime: boolean): boolean =>
	computeDomain(stateObj.entity_id) === "input_datetime" &&
	Boolean(stateObj.attributes.has_date) === hasDate &&
	(hasDate ? Boolean(stateObj.attributes.has_time) === hasTime : true);

// The parts all three kinds share: limits from the config or the defaults.
const rangeFromConfig = (
	config: EntityRangeSliderConfig,
	defaults: [number, number, number],
	parseLimit: (setting: unknown) => number,
): SliderRange => ({
	min: isSet(config.min) ? parseLimit(config.min) : defaults[0],
	max: isSet(config.max) ? parseLimit(config.max) : defaults[1],
	step: isSet(config.step) ? Number(config.step) : defaults[2],
	unit: "",
});

const defaultsOf = (min: string, max: string, step: number): SliderRangeDefaults => ({ min, max, step: String(step) });

export const timeKind: ValueKind = {
	id: "time",
	domains: ["input_datetime", "time"],
	// Too long for the space next to the slider.
	position: "below",
	holds: (stateObj) => computeDomain(stateObj.entity_id) === "time" || isInputDatetime(stateObj, false, true),
	// The whole day in steps of 15 minutes.
	range: (config) => rangeFromConfig(config, [0, 24 * 60 - 1, 15], parseTime),
	defaults: () => defaultsOf("00:00", "23:59", 15),
	value: (stateObj) => parseTime(stateObj.state),
	round: (value) => Math.round(value),
	format: (stateObjs, _range, hass) => stateObjs.map((stateObj) => formatTime(parseTime(stateObj.state), hass)).join(" - "),
	valueFormatter: (hass) => (value) => formatTime(value, hass),
	save: (hass, entityId, value) => saveDateTime(hass, entityId, { time: isoTime(value * MINUTE_MS) }),
};

export const dateKind: ValueKind = {
	id: "date",
	domains: ["input_datetime", "date"],
	position: "below",
	holds: (stateObj) => computeDomain(stateObj.entity_id) === "date" || isInputDatetime(stateObj, true, false),
	// Today and the 30 days after it, in steps of one day.
	range: (config, _lower, _upper, hass) => {
		const today = todayStart(hass) / DAY_MS;
		return rangeFromConfig(config, [today, today + 30, 1], (setting) => Math.floor(parseDate(setting, hass) / DAY_MS));
	},
	defaults: () => defaultsOf("today", "+30d", 1),
	value: (stateObj) => parseLocalDateTime(stateObj.state) / DAY_MS,
	round: (value) => Math.round(value),
	format: (stateObjs, _range, hass) =>
		stateObjs.map((stateObj) => formatDate(parseLocalDateTime(stateObj.state), false, hass)).join(" - "),
	valueFormatter: (hass) => (value) => formatDate(value * DAY_MS, false, hass),
	save: (hass, entityId, value) => saveDateTime(hass, entityId, { date: isoDate(value * DAY_MS) }),
};

// A datetime entity's state is a moment, an input_datetime's a local time.
const dateTimeValue = (stateObj: HassEntity, hass: HomeAssistant): number =>
	computeDomain(stateObj.entity_id) === "datetime"
		? Math.round(
				toLocalTime(Date.parse(stateObj.state), resolveTimeZone(hass.locale.time_zone, hass.config.time_zone)) /
					MINUTE_MS,
			)
		: Math.round(parseLocalDateTime(stateObj.state) / MINUTE_MS);

export const dateTimeKind: ValueKind = {
	id: "datetime",
	domains: ["input_datetime", "datetime"],
	position: "below",
	holds: (stateObj) => computeDomain(stateObj.entity_id) === "datetime" || isInputDatetime(stateObj, true, true),
	// Today and the 30 days after it, in steps of one hour.
	range: (config, _lower, _upper, hass) => {
		const today = todayStart(hass);
		return rangeFromConfig(config, [today / MINUTE_MS, (today + 30 * DAY_MS) / MINUTE_MS, 60], (setting) =>
			Math.round(parseDate(setting, hass) / MINUTE_MS),
		);
	},
	defaults: () => defaultsOf("today", "+30d", 60),
	value: dateTimeValue,
	round: (value) => Math.round(value),
	format: (stateObjs, _range, hass) =>
		stateObjs.map((stateObj) => formatDate(dateTimeValue(stateObj, hass) * MINUTE_MS, true, hass)).join(" - "),
	valueFormatter: (hass) => (value) => formatDate(value * MINUTE_MS, true, hass),
	save: (hass, entityId, value) => {
		const localMs = value * MINUTE_MS;
		return computeDomain(entityId) === "input_datetime"
			? saveDateTime(hass, entityId, { datetime: `${isoDate(localMs)} ${isoTime(localMs)}` })
			: saveDateTime(hass, entityId, {
					datetime: new Date(
						fromLocalTime(localMs, resolveTimeZone(hass.locale.time_zone, hass.config.time_zone)),
					).toISOString(),
				});
	},
};
