// Home Assistant's slider pushes the other handle along when one handle
// reaches it. Unless pushing is allowed, the handle stops there instead, like
// the heat and cool handles of Home Assistant's thermostat card. When both
// handles sit on the same spot, the drag direction picks the handle.

import type { HaSlider } from "./home-assistant";

// The lower ("min") or the upper ("max") handle, in ha-slider's words.
type Handle = "min" | "max";

const findAccessor = (object: object, key: string): PropertyDescriptor | undefined => {
	for (let proto = Object.getPrototypeOf(object); proto; proto = Object.getPrototypeOf(proto)) {
		const descriptor = Object.getOwnPropertyDescriptor(proto, key);
		if (descriptor) {
			return descriptor;
		}
	}
	return undefined;
};

// canPush tells whether a handle may push the other one right now, for
// example when the card sets both values itself.
export const stopAtOtherHandle = (slider: HaSlider, canPush: () => boolean): void => {
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

	// Moves the handle picked below, also when the slider started dragging the other one.
	const setThumbValue = slider.setThumbValueFromCoordinates;
	if (typeof setThumbValue === "function") {
		slider.setThumbValueFromCoordinates = function (this: HaSlider, x, y, thumb) {
			return setThumbValue.call(this, x, y, this.activeThumb || thumb);
		};
	}

	for (const [key, handle] of [
		["minValue", "min"],
		["maxValue", "max"],
	] as const) {
		const { get, set } = accessors[key] as Required<Pick<PropertyDescriptor, "get" | "set">>;
		Object.defineProperty(slider, key, {
			configurable: true,
			get() {
				return get.call(this);
			},
			set(this: HaSlider, value: number) {
				const moving: Handle | null = this.activeThumb;
				if (canPush() || !moving) {
					set.call(this, value);
					return;
				}
				if (moving !== handle) {
					// The slider tries to push this handle along.
					if (startedTogether && this.minValue === this.maxValue && value !== get.call(this)) {
						startedTogether = false;
						this.activeThumb = handle;
						// Makes the slider report the change when the drag ends.
						this.valueWhenDraggingStarted = NaN;
						set.call(this, value);
						this.showRangeTooltips?.();
					}
					return;
				}
				const stopped = handle === "min" ? Math.min(value, this.maxValue) : Math.max(value, this.minValue);
				if (stopped !== get.call(this)) {
					// The handle really moved, so the drag direction is chosen.
					startedTogether = false;
				}
				set.call(this, stopped);
			},
		});
	}
};
