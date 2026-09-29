import { expect, type Locator, type Page } from "@playwright/test";

export interface SavedCall {
	domain: string;
	service: string;
	data: Record<string, unknown>;
	entity_id: string;
}

declare global {
	interface Window {
		pageReady?: boolean;
		addCard(id: string, config: Record<string, unknown>, options?: { row?: boolean }): void;
		setState(entityId: string, state: string): void;
		calls: SavedCall[];
	}
}

// Collects errors thrown in the page, so a test can check there were none.
export const trackPageErrors = (page: Page): Error[] => {
	const errors: Error[] = [];
	page.on("pageerror", (error) => errors.push(error));
	return errors;
};

export const openPage = async (page: Page): Promise<void> => {
	await page.goto("/");
	await page.waitForFunction(() => window.pageReady === true);
};

export const setState = (page: Page, entityId: string, state: string): Promise<void> =>
	page.evaluate(([id, value]) => window.setState(id, value), [entityId, state]);

export const addCard = async (
	page: Page,
	id: string,
	config: Record<string, unknown>,
	options: { row?: boolean } = {},
): Promise<Locator> => {
	await page.evaluate(([cardId, cardConfig, cardOptions]) => window.addCard(cardId, cardConfig, cardOptions), [
		id,
		{ type: `custom:${options.row ? "entity-range-slider-row" : "entity-range-slider"}`, ...config },
		options,
	] as const);
	return page.locator(`#${id}`);
};

// Home Assistant's slider in a card. Locators look into open shadow roots.
export const sliderOf = (card: Locator): Locator => card.locator("ha-slider");

export const handleOf = (card: Locator, handle: "min" | "max"): Locator => sliderOf(card).locator(`#thumb-${handle}`);

export const sliderValues = (card: Locator): Promise<[number, number]> =>
	sliderOf(card).evaluate((slider: any) => [slider.minValue, slider.maxValue] as [number, number]);

export const savedCalls = (page: Page): Promise<SavedCall[]> => page.evaluate(() => window.calls);

// Drags a handle with the mouse to where a value sits on the track.
export const dragHandle = async (page: Page, card: Locator, handle: "min" | "max", toValue: number): Promise<void> => {
	const slider = sliderOf(card);
	await expect(slider).toBeVisible();
	const { min, max } = await slider.evaluate((element: any) => ({ min: element.min, max: element.max }));
	const track = await slider.locator("#track").boundingBox();
	const thumb = await handleOf(card, handle).boundingBox();
	if (!track || !thumb) {
		throw new Error("The slider is not on the page");
	}
	const y = thumb.y + thumb.height / 2;
	await page.mouse.move(thumb.x + thumb.width / 2, y);
	await page.mouse.down();
	await page.mouse.move(track.x + ((toValue - min) / (max - min)) * track.width, y, { steps: 10 });
	await page.mouse.up();
};

// Moves a handle with the keyboard, one step per key press.
export const pressOnHandle = async (card: Locator, handle: "min" | "max", key: string, times = 1): Promise<void> => {
	const thumb = handleOf(card, handle);
	await thumb.focus();
	for (let i = 0; i < times; i++) {
		await thumb.press(key);
	}
	await thumb.blur();
};
