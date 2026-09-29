/**
 * End-to-end tests for the card and the row, on a page with Home Assistant's
 * real slider and a fake hass object.
 *
 * Run with:
 *   npm run test:e2e
 */
import { expect, test } from "@playwright/test";

import {
	addCard,
	dragHandle,
	openPage,
	pressOnHandle,
	savedCalls,
	setState,
	sliderOf,
	sliderValues,
	trackPageErrors,
} from "./helpers";

const heating = { entity_low: "input_number.heating_low", entity_high: "input_number.heating_high" };

test.beforeEach(async ({ page }) => {
	await openPage(page);
});

test.describe("Loading", () => {
	test("the card, the row and the editor load without errors", async ({ page }) => {
		const errors = trackPageErrors(page);
		await page.reload();
		await page.waitForFunction(() => window.pageReady === true);
		const card = await addCard(page, "card", heating);
		const row = await addCard(page, "row", heating, { row: true });
		await expect(sliderOf(card)).toBeVisible();
		await expect(sliderOf(row)).toBeVisible();
		const defined = await page.evaluate(() =>
			["entity-range-slider", "entity-range-slider-row", "entity-range-slider-editor"].map((tag) =>
				Boolean(customElements.get(tag)),
			),
		);
		expect(defined).toEqual([true, true, true]);
		expect(errors).toEqual([]);
	});

	test("the card is offered in the card picker", async ({ page }) => {
		const types = await page.evaluate(() => (window as any).customCards.map((card: { type: string }) => card.type));
		expect(types).toContain("entity-range-slider");
	});

	test("a missing entity shows Home Assistant's warning instead of the slider", async ({ page }) => {
		const card = await addCard(page, "card", { ...heating, entity_high: "input_number.missing" });
		await expect(card.locator("hui-warning")).toContainText("input_number.missing");
		await expect(sliderOf(card)).toHaveCount(0);
	});
});

test.describe("Saving", () => {
	test("dragging a handle saves only that entity", async ({ page }) => {
		const card = await addCard(page, "card", heating);
		await dragHandle(page, card, "min", 15);
		await expect.poll(() => savedCalls(page)).toEqual([
			{ domain: "input_number", service: "set_value", data: { value: 15 }, entity_id: "input_number.heating_low" },
		]);
		expect(await sliderValues(card)).toEqual([15, 22]);
	});

	test("a row in an entities card saves too", async ({ page }) => {
		const row = await addCard(page, "row", heating, { row: true });
		await dragHandle(page, row, "max", 26);
		await expect.poll(() => savedCalls(page)).toEqual([
			{ domain: "input_number", service: "set_value", data: { value: 26 }, entity_id: "input_number.heating_high" },
		]);
	});

	test("the keyboard moves a handle one step per key", async ({ page }) => {
		const card = await addCard(page, "card", heating);
		await pressOnHandle(card, "max", "ArrowRight", 2);
		await expect.poll(() => sliderValues(card)).toEqual([18, 23]);
		await expect.poll(async () => (await savedCalls(page)).at(-1)).toMatchObject({
			entity_id: "input_number.heating_high",
			data: { value: 23 },
		});
	});

	test("a failed save puts the handle back", async ({ page }) => {
		const card = await addCard(page, "card", {
			entity_low: "input_number.failing_low",
			entity_high: "input_number.failing_high",
		});
		await dragHandle(page, card, "min", 10);
		await expect.poll(async () => (await savedCalls(page)).length).toBe(1);
		await expect.poll(() => sliderValues(card)).toEqual([18, 22]);
	});

	test("a new state from Home Assistant moves the handles", async ({ page }) => {
		const card = await addCard(page, "card", heating);
		await expect(sliderOf(card)).toBeVisible();
		await setState(page, "input_number.heating_low", "12.5");
		await expect.poll(() => sliderValues(card)).toEqual([12.5, 22]);
	});

	test("an entity without a value disables the slider", async ({ page }) => {
		const card = await addCard(page, "card", heating);
		await expect(sliderOf(card)).toBeVisible();
		await setState(page, "input_number.heating_high", "unavailable");
		await expect.poll(() => sliderOf(card).evaluate((slider: any) => slider.disabled)).toBe(true);
	});
});

test.describe("Handles", () => {
	test("a handle stops at the other handle", async ({ page }) => {
		const card = await addCard(page, "card", heating);
		await dragHandle(page, card, "min", 27);
		await expect.poll(() => savedCalls(page)).toEqual([
			{ domain: "input_number", service: "set_value", data: { value: 22 }, entity_id: "input_number.heating_low" },
		]);
		expect(await sliderValues(card)).toEqual([22, 22]);
	});

	test("with push, a handle pushes the other handle along", async ({ page }) => {
		const card = await addCard(page, "card", { ...heating, push: true });
		await dragHandle(page, card, "min", 27);
		await expect
			.poll(async () => (await savedCalls(page)).map((call) => `${call.entity_id}=${call.data.value}`).sort())
			.toEqual(["input_number.heating_high=27", "input_number.heating_low=27"]);
	});

	test("on the same spot, the drag direction picks the handle", async ({ page }) => {
		await setState(page, "input_number.heating_low", "20.0");
		await setState(page, "input_number.heating_high", "20.0");
		const card = await addCard(page, "card", heating);
		await dragHandle(page, card, "max", 25);
		await expect.poll(() => sliderValues(card)).toEqual([20, 25]);
		await dragHandle(page, card, "min", 15);
		await expect.poll(() => sliderValues(card)).toEqual([15, 25]);
		expect((await savedCalls(page)).map((call) => `${call.entity_id}=${call.data.value}`)).toEqual([
			"input_number.heating_high=25",
			"input_number.heating_low=15",
		]);
	});

	test("a handle stops at the other handle with the keyboard too", async ({ page }) => {
		await setState(page, "input_number.heating_high", "18.5");
		const card = await addCard(page, "card", heating);
		await pressOnHandle(card, "min", "ArrowRight", 3);
		await expect.poll(() => sliderValues(card)).toEqual([18.5, 18.5]);
	});
});

test.describe("Times and dates", () => {
	test("a time is saved on a step of the slider", async ({ page }) => {
		const card = await addCard(page, "card", {
			entity_low: "input_datetime.heating_start",
			entity_high: "input_datetime.heating_end",
		});
		await dragHandle(page, card, "min", 8 * 60);
		await expect.poll(async () => (await savedCalls(page)).length).toBe(1);
		const [call] = await savedCalls(page);
		expect(call).toMatchObject({ domain: "input_datetime", service: "set_datetime", entity_id: "input_datetime.heating_start" });
		expect(call.data.time).toMatch(/^\d{2}:(00|15|30|45):00$/);
	});

	test("a time moves by the step in the config", async ({ page }) => {
		const card = await addCard(page, "card", {
			entity_low: "input_datetime.heating_start",
			entity_high: "input_datetime.heating_end",
			step: 30,
		});
		await pressOnHandle(card, "max", "ArrowRight");
		await expect.poll(async () => (await savedCalls(page)).at(-1)?.data).toEqual({ time: "22:30:00" });
	});

	test("a date is saved as a date", async ({ page }) => {
		const card = await addCard(page, "card", {
			entity_low: "input_datetime.vacation_from",
			entity_high: "input_datetime.vacation_to",
			min: "2026-10-01",
			max: "2026-10-31",
		});
		await pressOnHandle(card, "max", "ArrowRight");
		await expect.poll(async () => (await savedCalls(page)).at(-1)).toEqual({
			domain: "input_datetime",
			service: "set_datetime",
			data: { date: "2026-10-13" },
			entity_id: "input_datetime.vacation_to",
		});
	});

	test("an input_datetime with a date and a time is saved as a local time", async ({ page }) => {
		const card = await addCard(page, "card", {
			entity_low: "input_datetime.guests_start",
			entity_high: "input_datetime.guests_end",
			min: "2026-09-28",
			max: "2026-10-10",
		});
		await pressOnHandle(card, "max", "ArrowRight");
		await expect.poll(async () => (await savedCalls(page)).at(-1)?.data).toEqual({ datetime: "2026-10-03 19:00:00" });
	});

	test("a datetime entity is saved as a moment in the server's time zone", async ({ page }) => {
		const card = await addCard(page, "card", {
			entity_low: "datetime.charging_start",
			entity_high: "datetime.charging_end",
			min: "2026-10-01",
			max: "2026-10-10",
		});
		// 08:00 UTC is 10:00 in Copenhagen, one hour later is 09:00 UTC.
		await pressOnHandle(card, "max", "ArrowRight");
		await expect.poll(async () => (await savedCalls(page)).at(-1)).toEqual({
			domain: "datetime",
			service: "set_value",
			data: { datetime: "2026-10-03T09:00:00.000Z" },
			entity_id: "datetime.charging_end",
		});
		await expect.poll(() => sliderValues(card).then(([, high]) => high)).toBe(
			Date.parse("2026-10-03T11:00:00Z") / 60_000,
		);
	});
});
