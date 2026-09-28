// The lower and the upper entity as a pair: finds the two entities of a pair
// like input_number.heating_low and input_number.heating_high, to suggest the
// card in the card picker, and names the pair.

import { computeDomain, type HassEntity, type HomeAssistant } from "./home-assistant";
import { DOMAINS, kindsOfEntity } from "./kinds";

// Words that mark the lower and the upper entity of a pair in entity IDs, in
// English, Danish, German and Spanish, as Home Assistant writes them in
// entity IDs (without accents).
const PAIR_WORDS = [
	["min", "max"],
	["min", "maks"],
	["minimum", "maximum"],
	["minimo", "maximo"],
	["low", "high"],
	["lav", "hoj"],
	["niedrig", "hoch"],
	["bajo", "alto"],
	["lower", "upper"],
	["untere", "obere"],
	["unterer", "oberer"],
	["inferior", "superior"],
	["from", "to"],
	["fra", "til"],
	["von", "bis"],
	["desde", "hasta"],
	["start", "end"],
	["start", "slut"],
	["start", "ende"],
	["beginn", "ende"],
	["anfang", "ende"],
	["inicio", "fin"],
];

export interface EntityPair {
	entity_min: string;
	entity_max: string;
}

// The pair an entity belongs to, when the other entity exists.
export const findEntityPair = (hass: HomeAssistant, entityId: string): EntityPair | null => {
	const [domain, objectId] = entityId.split(".");
	if (!DOMAINS.includes(domain) || !objectId) {
		return null;
	}
	const words = objectId.split("_");
	for (const [lowWord, highWord] of PAIR_WORDS) {
		for (const [from, to, isLower] of [
			[lowWord, highWord, true],
			[highWord, lowWord, false],
		] as const) {
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

// The entities of a new card: a pair when there is one, else two numbers.
// Entities on the current view come first, like in Home Assistant's own cards.
export const stubConfig = (hass: HomeAssistant, entities: string[] = [], entitiesFill: string[] = []): EntityPair => {
	const candidates = [...new Set([...entities, ...entitiesFill, ...Object.keys(hass.states)])].filter((entityId) =>
		DOMAINS.includes(computeDomain(entityId)),
	);
	for (const entityId of candidates) {
		const pair = findEntityPair(hass, entityId);
		if (pair) {
			return pair;
		}
	}
	const numbers = candidates.filter((entityId) => kindsOfEntity(entityId).some((kind) => kind.id === "number"));
	return { entity_min: numbers[0] ?? "", entity_max: numbers[1] ?? "" };
};

// Default name: the words both entity names share, for example "Heating low"
// and "Heating high" give "Heating".
export const computePairName = (hass: HomeAssistant, lower: HassEntity, upper: HassEntity): string => {
	const nameOf = (stateObj: HassEntity) =>
		hass.formatEntityName(stateObj, undefined) || stateObj.attributes.friendly_name || stateObj.entity_id;
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
	while (end < first.length && end < second.length && first[first.length - 1 - end] === second[second.length - 1 - end]) {
		end++;
	}
	if (end) {
		const words = first.slice(first.length - end).join(" ");
		return words.charAt(0).toUpperCase() + words.slice(1);
	}
	return nameOf(lower);
};
