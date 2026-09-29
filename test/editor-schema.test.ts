import { describe, expect, it } from "vitest";

import { buildSchema, type SchemaOptions } from "../src/editor-schema";
import { hasTranslation } from "../src/i18n";
import { DOMAINS } from "../src/kinds";
import { validateEditorConfig } from "../src/validators";

interface Field {
	name: string;
	type?: string;
	disabled?: boolean;
	default?: string;
	selector?: Record<string, any>;
	schema?: Field[];
}

const options: SchemaOptions = { language: "en", defaults: {}, fullWidth: false };

// The fields of the form, without the sections and grids around them.
const fieldsOf = (schema: Field[]): Field[] =>
	schema.flatMap((field) => (field.schema ? fieldsOf(field.schema) : [field]));

const fieldNamed = (schema: Field[], name: string): Field => {
	const field = fieldsOf(schema).find((candidate) => candidate.name === name);
	if (!field) {
		throw new Error(`No field ${name}`);
	}
	return field;
};

describe("buildSchema", () => {
	it("offers only entities the card supports", () => {
		const schema = buildSchema(options) as Field[];
		for (const name of ["entity_low", "entity_high"]) {
			expect(fieldNamed(schema, name).selector).toEqual({ entity: { filter: { domain: DOMAINS } } });
		}
	});

	it("offers only show and position values the config accepts", () => {
		const schema = buildSchema(options) as Field[];
		for (const name of ["show", "position"]) {
			const values = fieldNamed(schema, name).selector!.select.options.map((option: { value: string }) => option.value);
			expect(values.length).toBeGreaterThan(1);
			for (const value of values) {
				expect(() => validateEditorConfig({ type: "custom:entity-range-slider", [name]: value })).not.toThrow();
			}
		}
	});

	it("only lets position be chosen when the slider is not full width", () => {
		expect(fieldNamed(buildSchema(options) as Field[], "position").disabled).toBe(false);
		expect(fieldNamed(buildSchema({ ...options, fullWidth: true }) as Field[], "position").disabled).toBe(true);
	});

	it("shows the defaults of the entities in the slider fields", () => {
		const schema = buildSchema({ ...options, defaults: { min: "today", max: "+30d", step: "1" } }) as Field[];
		expect(["min", "max", "step", "unit"].map((name) => fieldNamed(schema, name).default)).toEqual([
			"today",
			"+30d",
			"1",
			undefined,
		]);
	});

	it("gives every field a label", () => {
		// Home Assistant labels these generic fields itself.
		const labelledByHomeAssistant = ["name", "icon", "color", "secondary_info", "unit"];
		const fields = fieldsOf(buildSchema(options) as Field[]);
		const unlabelled = fields
			.map((field) => field.name)
			.filter((name) => name && !name.endsWith("_action") && !hasTranslation(`label.${name}`));
		expect(unlabelled).toEqual(labelledByHomeAssistant);
	});

	it("only holds settings the config accepts", () => {
		const config: Record<string, unknown> = { type: "custom:entity-range-slider" };
		for (const field of fieldsOf(buildSchema(options) as Field[])) {
			if (field.selector?.boolean) {
				config[field.name] = true;
			} else if (field.selector?.select) {
				config[field.name] = field.selector.select.options[0].value;
			}
		}
		expect(() => validateEditorConfig(config)).not.toThrow();
	});
});
