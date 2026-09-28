import { computeDomain, type HassEntity } from "../home-assistant";
import { dateKind, dateTimeKind, timeKind } from "./date-time";
import { numberKind } from "./number";
import type { ValueKind } from "./value-kind";

export type { SliderRange, SliderRangeDefaults, ValueKind } from "./value-kind";

// Every kind of value the card supports. The first kind that holds an entity's
// value handles it.
export const KINDS: readonly ValueKind[] = [numberKind, timeKind, dateKind, dateTimeKind];

// Every entity domain the card supports.
export const DOMAINS: readonly string[] = [...new Set(KINDS.flatMap((kind) => kind.domains))];

export const kindOf = (stateObj: HassEntity): ValueKind | undefined => KINDS.find((kind) => kind.holds(stateObj));

// The kinds an entity of a domain can hold, before its state is known.
export const kindsOfDomain = (domain: string): ValueKind[] => KINDS.filter((kind) => kind.domains.includes(domain));

export const kindsOfEntity = (entityId: string): ValueKind[] => kindsOfDomain(computeDomain(entityId));
