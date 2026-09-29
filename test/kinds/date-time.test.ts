import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import type { EntityRangeSliderConfig } from "../../src/config";
import { dateKind, dateTimeKind, timeKind } from "../../src/kinds/date-time";
import { createEntity, createHass } from "../fake_data/hass";

const MINUTE_MS = 60_000;
const DAY_MS = 86_400_000;

// A day number and a minute number, as the slider holds dates and dates with times.
const day = (date: string) => Date.parse(`${date}T00:00:00Z`) / DAY_MS;
const minute = (dateTime: string) => Date.parse(`${dateTime}Z`) / MINUTE_MS;

const config = (entityLow: string, entityHigh: string, extra: Partial<EntityRangeSliderConfig> = {}) => ({
	type: "custom:entity-range-slider",
	entity_low: entityLow,
	entity_high: entityHigh,
	...extra,
});

const inputDatetime = (entityId: string, state: string, hasDate: boolean, hasTime: boolean) =>
	createEntity(entityId, state, { has_date: hasDate, has_time: hasTime });

// The server is in Copenhagen (UTC+2 until 25 October 2026), the browser in UTC.
const hass = createHass([], { timeZone: "Europe/Copenhagen", locale: { language: "en", time_format: "24" } });

beforeAll(() => {
	// 23:30 UTC is already the next day in Copenhagen.
	vi.useFakeTimers({ now: new Date("2026-09-30T23:30:00Z"), toFake: ["Date"] });
});

afterAll(() => {
	vi.useRealTimers();
});

describe("which kind holds an entity", () => {
	it("follows the domain", () => {
		expect(timeKind.holds(createEntity("time.start", "06:30:00"))).toBe(true);
		expect(dateKind.holds(createEntity("date.from", "2026-10-05"))).toBe(true);
		expect(dateTimeKind.holds(createEntity("datetime.start", "2026-10-01T07:00:00+00:00"))).toBe(true);
		expect(timeKind.holds(createEntity("date.from", "2026-10-05"))).toBe(false);
	});

	it("follows the settings of an input_datetime", () => {
		const time = inputDatetime("input_datetime.a", "06:30:00", false, true);
		const date = inputDatetime("input_datetime.b", "2026-10-05", true, false);
		const both = inputDatetime("input_datetime.c", "2026-10-05 06:30:00", true, true);
		expect([timeKind, dateKind, dateTimeKind].map((kind) => kind.holds(time))).toEqual([true, false, false]);
		expect([timeKind, dateKind, dateTimeKind].map((kind) => kind.holds(date))).toEqual([false, true, false]);
		expect([timeKind, dateKind, dateTimeKind].map((kind) => kind.holds(both))).toEqual([false, false, true]);
	});
});

describe("timeKind", () => {
	const start = createEntity("time.start", "06:30:00");
	const end = createEntity("time.end", "22:00:00");

	it("holds a time as its minute of the day", () => {
		expect(timeKind.value(start, hass)).toBe(6 * 60 + 30);
		expect(timeKind.value(createEntity("time.x", "unknown"), hass)).toBeNaN();
	});

	it("reads times from the config", () => {
		expect(
			timeKind.range(config("time.start", "time.end", { min: "06:00", max: "22:00:00", step: 30 }), start, end, hass),
		).toEqual({ min: 6 * 60, max: 22 * 60, step: 30, unit: "" });
		expect(timeKind.range(config("time.start", "time.end", { min: "6 am" }), start, end, hass).min).toBeNaN();
	});

	it("formats times in the time format of the user profile", () => {
		expect(timeKind.format([start, end], timeKind.range(config("a.a", "b.b"), start, end, hass), hass)).toBe(
			"06:30 - 22:00",
		);
		const amPm = createHass([], { locale: { language: "en", time_format: "12" } });
		expect(timeKind.valueFormatter?.(amPm)(22 * 60)).toBe("10:00 PM");
	});

	it("saves with the entity's own action", async () => {
		const saved = createHass();
		await timeKind.save(saved, "input_datetime.start", 6 * 60 + 45);
		await timeKind.save(saved, "time.start", 23 * 60 + 59);
		expect(saved.calls).toEqual([
			{ domain: "input_datetime", service: "set_datetime", data: { time: "06:45:00" }, entityId: "input_datetime.start" },
			{ domain: "time", service: "set_value", data: { time: "23:59:00" }, entityId: "time.start" },
		]);
	});
});

describe("dateKind", () => {
	const from = createEntity("date.from", "2026-10-05");
	const to = createEntity("date.to", "2027-01-15");

	it("holds a date as its day number", () => {
		expect(dateKind.value(from, hass)).toBe(day("2026-10-05"));
	});

	it("covers today and the 30 days after it in the server's time zone", () => {
		expect(dateKind.range(config("date.from", "date.to"), from, to, hass)).toEqual({
			min: day("2026-10-01"),
			max: day("2026-10-31"),
			step: 1,
			unit: "",
		});
	});

	it("follows the browser's time zone when the user profile asks for it", () => {
		const local = createHass([], { locale: { time_zone: "local" } });
		expect(dateKind.range(config("date.from", "date.to"), from, to, local).min).toBe(day("2026-09-30"));
	});

	it("reads dates and dates relative to today from the config", () => {
		const read = (setting: string) => dateKind.range(config("a.a", "b.b", { min: setting }), from, to, hass).min;
		expect(read("2026-12-24")).toBe(day("2026-12-24"));
		expect(read("today")).toBe(day("2026-10-01"));
		expect(read("+7d")).toBe(day("2026-10-08"));
		expect(read("-7d")).toBe(day("2026-09-24"));
		expect(read("banana")).toBeNaN();
	});

	it("shows the year only when it is not this year", () => {
		expect(dateKind.format([from, to], dateKind.range(config("a.a", "b.b"), from, to, hass), hass)).toBe(
			"Oct 5 - Jan 15, 2027",
		);
	});

	it("saves with the entity's own action", async () => {
		const saved = createHass();
		await dateKind.save(saved, "input_datetime.from", day("2026-10-07"));
		await dateKind.save(saved, "date.to", day("2027-01-01"));
		expect(saved.calls).toEqual([
			{ domain: "input_datetime", service: "set_datetime", data: { date: "2026-10-07" }, entityId: "input_datetime.from" },
			{ domain: "date", service: "set_value", data: { date: "2027-01-01" }, entityId: "date.to" },
		]);
	});
});

describe("dateTimeKind", () => {
	it("holds an input_datetime as the local time it is", () => {
		const start = inputDatetime("input_datetime.start", "2026-10-01 07:00:00", true, true);
		expect(dateTimeKind.value(start, hass)).toBe(minute("2026-10-01T07:00:00"));
	});

	it("holds a datetime entity in the time zone of the user profile", () => {
		const start = createEntity("datetime.start", "2026-09-30T16:00:00+00:00");
		expect(dateTimeKind.value(start, hass)).toBe(minute("2026-09-30T18:00:00"));
		const local = createHass([], { locale: { time_zone: "local" } });
		expect(dateTimeKind.value(start, local)).toBe(minute("2026-09-30T16:00:00"));
	});

	it("covers today and the 30 days after it in steps of one hour", () => {
		const start = createEntity("datetime.start", "2026-10-01T07:00:00+00:00");
		expect(dateTimeKind.range(config("datetime.a", "datetime.b"), start, start, hass)).toEqual({
			min: minute("2026-10-01T00:00:00"),
			max: minute("2026-10-31T00:00:00"),
			step: 60,
			unit: "",
		});
	});

	it("saves an input_datetime as a local time", async () => {
		const saved = createHass();
		await dateTimeKind.save(saved, "input_datetime.start", minute("2026-10-01T07:30:00"));
		expect(saved.calls[0]).toEqual({
			domain: "input_datetime",
			service: "set_datetime",
			data: { datetime: "2026-10-01 07:30:00" },
			entityId: "input_datetime.start",
		});
	});

	it("saves a datetime entity as a moment, also across a daylight saving change", async () => {
		const saved = createHass([], { timeZone: "Europe/Copenhagen" });
		await dateTimeKind.save(saved, "datetime.start", minute("2026-10-02T10:00:00"));
		await dateTimeKind.save(saved, "datetime.end", minute("2026-10-26T10:00:00"));
		expect(saved.calls.map((call) => call.data)).toEqual([
			{ datetime: "2026-10-02T08:00:00.000Z" },
			{ datetime: "2026-10-26T09:00:00.000Z" },
		]);
	});

	it("gives a saved datetime back as the same slider value", () => {
		const value = minute("2026-10-26T10:00:00");
		const stateObj = createEntity("datetime.end", "2026-10-26T09:00:00+00:00");
		expect(dateTimeKind.value(stateObj, hass)).toBe(value);
	});
});
