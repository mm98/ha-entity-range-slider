/* Entity range slider 0.6.0, https://github.com/mm98/ha-entity-range-slider */
"use strict";
(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __knownSymbol = (name, symbol) => (symbol = Symbol[name]) ? symbol : /* @__PURE__ */ Symbol.for("Symbol." + name);
  var __typeError = (msg) => {
    throw TypeError(msg);
  };
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
  var __decoratorStart = (base) => [, , , __create(base?.[__knownSymbol("metadata")] ?? null)];
  var __decoratorStrings = ["class", "method", "getter", "setter", "accessor", "field", "value", "get", "set"];
  var __expectFn = (fn) => fn !== void 0 && typeof fn !== "function" ? __typeError("Function expected") : fn;
  var __decoratorContext = (kind, name, done, metadata, fns) => ({ kind: __decoratorStrings[kind], name, metadata, addInitializer: (fn) => done._ ? __typeError("Already initialized") : fns.push(__expectFn(fn || null)) });
  var __decoratorMetadata = (array, target) => __defNormalProp(target, __knownSymbol("metadata"), array[3]);
  var __runInitializers = (array, flags, self, value) => {
    for (var i6 = 0, fns = array[flags >> 1], n7 = fns && fns.length; i6 < n7; i6++) flags & 1 ? fns[i6].call(self) : value = fns[i6].call(self, value);
    return value;
  };
  var __decorateElement = (array, flags, name, decorators, target, extra) => {
    var fn, it, done, ctx, access, k2 = flags & 7, s5 = !!(flags & 8), p3 = !!(flags & 16);
    var j2 = k2 > 3 ? array.length + 1 : k2 ? s5 ? 1 : 2 : 0, key = __decoratorStrings[k2 + 5];
    var initializers = k2 > 3 && (array[j2 - 1] = []), extraInitializers = array[j2] || (array[j2] = []);
    var desc = k2 && (!p3 && !s5 && (target = target.prototype), k2 < 5 && (k2 > 3 || !p3) && __getOwnPropDesc(k2 < 4 ? target : { get [name]() {
      return __privateGet(this, extra);
    }, set [name](x2) {
      return __privateSet(this, extra, x2);
    } }, name));
    k2 ? p3 && k2 < 4 && __name(extra, (k2 > 2 ? "set " : k2 > 1 ? "get " : "") + name) : __name(target, name);
    for (var i6 = decorators.length - 1; i6 >= 0; i6--) {
      ctx = __decoratorContext(k2, name, done = {}, array[3], extraInitializers);
      if (k2) {
        ctx.static = s5, ctx.private = p3, access = ctx.access = { has: p3 ? (x2) => __privateIn(target, x2) : (x2) => name in x2 };
        if (k2 ^ 3) access.get = p3 ? (x2) => (k2 ^ 1 ? __privateGet : __privateMethod)(x2, target, k2 ^ 4 ? extra : desc.get) : (x2) => x2[name];
        if (k2 > 2) access.set = p3 ? (x2, y3) => __privateSet(x2, target, y3, k2 ^ 4 ? extra : desc.set) : (x2, y3) => x2[name] = y3;
      }
      it = (0, decorators[i6])(k2 ? k2 < 4 ? p3 ? extra : desc[key] : k2 > 4 ? void 0 : { get: desc.get, set: desc.set } : target, ctx), done._ = 1;
      if (k2 ^ 4 || it === void 0) __expectFn(it) && (k2 > 4 ? initializers.unshift(it) : k2 ? p3 ? extra = it : desc[key] = it : target = it);
      else if (typeof it !== "object" || it === null) __typeError("Object expected");
      else __expectFn(fn = it.get) && (desc.get = fn), __expectFn(fn = it.set) && (desc.set = fn), __expectFn(fn = it.init) && initializers.unshift(fn);
    }
    return k2 || __decoratorMetadata(array, target), desc && __defProp(target, name, desc), p3 ? k2 ^ 4 ? extra : desc : target;
  };
  var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
  var __privateIn = (member, obj) => Object(obj) !== obj ? __typeError('Cannot use the "in" operator on this value') : member.has(obj);
  var __privateGet = (obj, member, getter) => (__accessCheck(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
  var __privateAdd = (obj, member, value) => member.has(obj) ? __typeError("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
  var __privateSet = (obj, member, value, setter) => (__accessCheck(obj, member, "write to private field"), setter ? setter.call(obj, value) : member.set(obj, value), value);
  var __privateMethod = (obj, member, method) => (__accessCheck(obj, member, "access private method"), method);

  // src/home-assistant.ts
  var UNAVAILABLE = "unavailable";
  var UNKNOWN = "unknown";
  var computeDomain = (entityId) => entityId.substring(0, entityId.indexOf("."));
  var fireEvent = (node, type, detail, options) => {
    options = options || {};
    const event = new Event(type, {
      bubbles: options.bubbles === void 0 ? true : options.bubbles,
      cancelable: Boolean(options.cancelable),
      composed: options.composed === void 0 ? true : options.composed
    });
    event.detail = detail === null || detail === void 0 ? {} : detail;
    node.dispatchEvent(event);
    return event;
  };
  var DISPLAY_KEYS = [
    "connected",
    "themes",
    "locale",
    "localize",
    "formatEntityState",
    "formatEntityAttributeName",
    "formatEntityAttributeValue",
    "formatEntityName"
  ];
  var hasHassChanged = (old, hass, entityIds) => !old || DISPLAY_KEYS.some((key) => old[key] !== hass[key]) || old.config.state !== hass.config.state || old.config.time_zone !== hass.config.time_zone || entityIds.some(
    (entityId) => old.states[entityId] !== hass.states[entityId] || old.entities[entityId] !== hass.entities[entityId]
  );
  var createEntityNotFoundWarning = (hass, entityId) => hass.config.state !== "NOT_RUNNING" ? hass.localize("ui.panel.lovelace.warning.entity_not_found", { entity: entityId }) : hass.localize("ui.panel.lovelace.warning.starting");
  var loading = /* @__PURE__ */ new Map();
  var loadOnce = (key, tags, load) => {
    let promise = loading.get(key);
    if (!promise) {
      promise = (async () => {
        if (!tags.every((tag) => customElements.get(tag))) {
          await load();
          await Promise.all(tags.map((tag) => customElements.whenDefined(tag)));
        }
      })();
      promise.catch(() => loading.delete(key));
      loading.set(key, promise);
    }
    return promise;
  };
  var loadRowElements = () => loadOnce("row", ["ha-slider", "hui-generic-entity-row", "hui-warning"], async () => {
    (await window.loadCardHelpers()).createRowElement({ type: "input-number-entity" });
  });
  var loadEditorElements = () => loadOnce("editor", ["ha-form"], async () => {
    (await window.loadCardHelpers()).createCardElement({ type: "entities", entities: [] });
    await customElements.whenDefined("hui-entities-card");
    const card = customElements.get("hui-entities-card");
    await card.getConfigElement();
  });

  // src/config.ts
  var SHOW_OPTIONS = ["both", "low", "high", "none"];
  var POSITIONS = ["inline", "below"];
  var isSet = (value) => value !== void 0 && value !== null && value !== "";

  // src/kinds/date-time.ts
  var MINUTE_MS = 6e4;
  var DAY_MS = 864e5;
  var LOCAL_TIME_ZONE = Intl.DateTimeFormat?.().resolvedOptions?.().timeZone;
  var resolveTimeZone = (option, serverTimeZone) => option === "local" && LOCAL_TIME_ZONE ? LOCAL_TIME_ZONE : serverTimeZone;
  var toLocalTime = (utcMs, timeZone) => {
    const parts = Object.fromEntries(
      new Intl.DateTimeFormat("en-US", {
        timeZone,
        hourCycle: "h23",
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric"
      }).formatToParts(new Date(utcMs)).map((part) => [part.type, Number(part.value)])
    );
    return Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second);
  };
  var fromLocalTime = (localMs, timeZone) => {
    let utcMs = localMs;
    for (let round = 0; round < 2; round++) {
      utcMs = localMs - (toLocalTime(utcMs, timeZone) - utcMs);
    }
    return utcMs;
  };
  var todayStart = (hass) => {
    const now = toLocalTime(Date.now(), resolveTimeZone(hass.locale.time_zone, hass.config.time_zone));
    return now - now % DAY_MS;
  };
  var parseLocalDateTime = (text) => {
    const match = String(text).match(/^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2})(?::(\d{2}))?)?/);
    if (!match) {
      return NaN;
    }
    const [year, month, day, hour, minute, second] = match.slice(1).map((part) => Number(part ?? 0));
    return Date.UTC(year, month - 1, day, hour, minute, second);
  };
  var parseTime = (text) => {
    const match = String(text).trim().match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
    return match ? Number(match[1]) * 60 + Number(match[2]) : NaN;
  };
  var parseDate = (setting, hass) => {
    const text = setting instanceof Date ? setting.toISOString() : String(setting).trim();
    const days = text === "today" ? "0" : text.match(/^([+-]\d+)d$/)?.[1];
    return days === void 0 ? parseLocalDateTime(text) : todayStart(hass) + Number(days) * DAY_MS;
  };
  var isoDate = (localMs) => new Date(localMs).toISOString().slice(0, 10);
  var isoTime = (localMs) => new Date(localMs).toISOString().slice(11, 19);
  var useAmPm = (locale) => {
    if (locale.time_format === "language" || locale.time_format === "system") {
      const testLanguage = locale.time_format === "language" ? locale.language : void 0;
      const test = (/* @__PURE__ */ new Date("January 1, 2023 22:00:00")).toLocaleString(testLanguage);
      return test.includes("10");
    }
    return locale.time_format === "12";
  };
  var formatTime = (minutes, hass) => {
    const amPm = useAmPm(hass.locale);
    return new Intl.DateTimeFormat(hass.locale.language, {
      hour: "numeric",
      minute: "2-digit",
      hourCycle: amPm ? "h12" : "h23",
      timeZone: "UTC"
    }).format(new Date(minutes * MINUTE_MS));
  };
  var formatDate = (localMs, withTime, hass) => {
    const amPm = useAmPm(hass.locale);
    const thisYear = new Date(todayStart(hass)).getUTCFullYear() === new Date(localMs).getUTCFullYear();
    return new Intl.DateTimeFormat(hass.locale.language, {
      ...thisYear ? {} : { year: "numeric" },
      month: "short",
      day: "numeric",
      ...withTime ? { hour: amPm ? "numeric" : "2-digit", minute: "2-digit", hourCycle: amPm ? "h12" : "h23" } : {},
      timeZone: "UTC"
    }).format(new Date(localMs));
  };
  var saveDateTime = (hass, entityId, data) => {
    const domain = computeDomain(entityId);
    const action = domain === "input_datetime" ? "set_datetime" : "set_value";
    return hass.callService(domain, action, data, { entity_id: entityId });
  };
  var isInputDatetime = (stateObj, hasDate, hasTime) => computeDomain(stateObj.entity_id) === "input_datetime" && Boolean(stateObj.attributes.has_date) === hasDate && (hasDate ? Boolean(stateObj.attributes.has_time) === hasTime : true);
  var rangeFromConfig = (config, defaults, parseLimit) => ({
    min: isSet(config.min) ? parseLimit(config.min) : defaults[0],
    max: isSet(config.max) ? parseLimit(config.max) : defaults[1],
    step: isSet(config.step) ? Number(config.step) : defaults[2],
    unit: ""
  });
  var defaultsOf = (min, max, step) => ({ min, max, step: String(step) });
  var timeKind = {
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
    save: (hass, entityId, value) => saveDateTime(hass, entityId, { time: isoTime(value * MINUTE_MS) })
  };
  var dateKind = {
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
    format: (stateObjs, _range, hass) => stateObjs.map((stateObj) => formatDate(parseLocalDateTime(stateObj.state), false, hass)).join(" - "),
    valueFormatter: (hass) => (value) => formatDate(value * DAY_MS, false, hass),
    save: (hass, entityId, value) => saveDateTime(hass, entityId, { date: isoDate(value * DAY_MS) })
  };
  var dateTimeValue = (stateObj, hass) => computeDomain(stateObj.entity_id) === "datetime" ? Math.round(
    toLocalTime(Date.parse(stateObj.state), resolveTimeZone(hass.locale.time_zone, hass.config.time_zone)) / MINUTE_MS
  ) : Math.round(parseLocalDateTime(stateObj.state) / MINUTE_MS);
  var dateTimeKind = {
    id: "datetime",
    domains: ["input_datetime", "datetime"],
    position: "below",
    holds: (stateObj) => computeDomain(stateObj.entity_id) === "datetime" || isInputDatetime(stateObj, true, true),
    // Today and the 30 days after it, in steps of one hour.
    range: (config, _lower, _upper, hass) => {
      const today = todayStart(hass);
      return rangeFromConfig(
        config,
        [today / MINUTE_MS, (today + 30 * DAY_MS) / MINUTE_MS, 60],
        (setting) => Math.round(parseDate(setting, hass) / MINUTE_MS)
      );
    },
    defaults: () => defaultsOf("today", "+30d", 60),
    value: dateTimeValue,
    round: (value) => Math.round(value),
    format: (stateObjs, _range, hass) => stateObjs.map((stateObj) => formatDate(dateTimeValue(stateObj, hass) * MINUTE_MS, true, hass)).join(" - "),
    valueFormatter: (hass) => (value) => formatDate(value * MINUTE_MS, true, hass),
    save: (hass, entityId, value) => {
      const localMs = value * MINUTE_MS;
      return computeDomain(entityId) === "input_datetime" ? saveDateTime(hass, entityId, { datetime: `${isoDate(localMs)} ${isoTime(localMs)}` }) : saveDateTime(hass, entityId, {
        datetime: new Date(
          fromLocalTime(localMs, resolveTimeZone(hass.locale.time_zone, hass.config.time_zone))
        ).toISOString()
      });
    }
  };

  // src/kinds/number.ts
  var NUMBER_DOMAINS = ["input_number", "number"];
  var decimalsOf = (number) => (String(number).split(".")[1] ?? "").length;
  var numberFormatToLocale = (localeOptions) => {
    switch (localeOptions.number_format) {
      case "comma_decimal":
        return ["en-US", "en"];
      case "decimal_comma":
        return ["de", "es", "it"];
      case "space_comma":
        return ["fr", "sv", "cs"];
      case "quote_decimal":
        return ["de-CH"];
      case "system":
        return void 0;
      default:
        return localeOptions.language;
    }
  };
  var formatNumberState = (hass, stateObj, step) => {
    const value = Number(stateObj.state);
    const precision = hass.entities[stateObj.entity_id]?.display_precision;
    let decimals;
    if (precision != null) {
      decimals = precision;
    } else if (Number.isInteger(step) && Number.isInteger(value)) {
      decimals = 0;
    } else {
      decimals = Math.max(decimalsOf(stateObj.state), decimalsOf(step));
    }
    const none = hass.locale.number_format === "none";
    return new Intl.NumberFormat(none ? "en-US" : numberFormatToLocale(hass.locale), {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
      useGrouping: !none
    }).format(value);
  };
  var blankBeforeUnit = (unit, localeOptions) => {
    if (unit === "°") {
      return "";
    }
    if (unit === "%") {
      return ["cs", "de", "fi", "fr", "sk", "sv"].includes(localeOptions.language) ? " " : "";
    }
    return " ";
  };
  var withUnit = (text, unit, localeOptions) => unit ? `${text}${blankBeforeUnit(unit, localeOptions)}${unit}` : text;
  var numberKind = {
    id: "number",
    domains: NUMBER_DOMAINS,
    // Like Home Assistant's number slider.
    position: "inline",
    holds: (stateObj) => NUMBER_DOMAINS.includes(computeDomain(stateObj.entity_id)),
    validateConfig(config) {
      for (const key of ["min", "max"]) {
        if (isSet(config[key]) && !Number.isFinite(Number(config[key]))) {
          throw new Error(`${key} must be a number.`);
        }
      }
      if (isSet(config.min) && isSet(config.max) && Number(config.min) >= Number(config.max)) {
        throw new Error("min must be below max.");
      }
    },
    range: (config, lower, upper) => ({
      min: Number(isSet(config.min) ? config.min : lower.attributes.min ?? 0),
      max: Number(isSet(config.max) ? config.max : upper.attributes.max ?? 100),
      step: Number(isSet(config.step) ? config.step : lower.attributes.step ?? upper.attributes.step ?? 1),
      unit: isSet(config.unit) ? String(config.unit) : lower.attributes.unit_of_measurement || upper.attributes.unit_of_measurement || ""
    }),
    defaults: (lower, upper) => {
      const text = (value) => isSet(value) ? String(value) : void 0;
      return {
        min: text(lower?.attributes.min),
        max: text(upper?.attributes.max),
        step: text(lower?.attributes.step ?? upper?.attributes.step),
        unit: text(lower?.attributes.unit_of_measurement || upper?.attributes.unit_of_measurement)
      };
    },
    value: (stateObj) => Number(stateObj.state),
    round: (value, range) => Number(value.toFixed(Math.max(decimalsOf(range.step), decimalsOf(range.min)))),
    // Two numbers share one unit: "18.0 - 22.0 °C".
    format: (stateObjs, range, hass) => withUnit(
      stateObjs.map((stateObj) => formatNumberState(hass, stateObj, range.step)).join(" - "),
      range.unit,
      hass.locale
    ),
    save: (hass, entityId, value) => hass.callService(computeDomain(entityId), "set_value", { value }, { entity_id: entityId })
  };

  // src/kinds/index.ts
  var KINDS = [numberKind, timeKind, dateKind, dateTimeKind];
  var DOMAINS = [...new Set(KINDS.flatMap((kind) => kind.domains))];
  var kindOf = (stateObj) => KINDS.find((kind) => kind.holds(stateObj));
  var kindsOfDomain = (domain) => KINDS.filter((kind) => kind.domains.includes(domain));
  var kindsOfEntity = (entityId) => kindsOfDomain(computeDomain(entityId));

  // src/entity-pair.ts
  var PAIR_WORDS = [
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
    ["inicio", "fin"]
  ];
  var findEntityPair = (hass, entityId) => {
    const [domain, objectId] = entityId.split(".");
    if (!DOMAINS.includes(domain) || !objectId) {
      return null;
    }
    const words = objectId.split("_");
    for (const [lowWord, highWord] of PAIR_WORDS) {
      for (const [from, to, isLower] of [
        [lowWord, highWord, true],
        [highWord, lowWord, false]
      ]) {
        const index = words.indexOf(from);
        if (index === -1) {
          continue;
        }
        const other = `${domain}.${[...words.slice(0, index), to, ...words.slice(index + 1)].join("_")}`;
        if (hass.states[other]) {
          return isLower ? { entity_low: entityId, entity_high: other } : { entity_low: other, entity_high: entityId };
        }
      }
    }
    return null;
  };
  var stubConfig = (hass, entities = [], entitiesFill = []) => {
    const candidates = [.../* @__PURE__ */ new Set([...entities, ...entitiesFill, ...Object.keys(hass.states)])].filter(
      (entityId) => DOMAINS.includes(computeDomain(entityId))
    );
    for (const entityId of candidates) {
      const pair = findEntityPair(hass, entityId);
      if (pair) {
        return pair;
      }
    }
    const numbers = candidates.filter((entityId) => kindsOfEntity(entityId).some((kind) => kind.id === "number"));
    return { entity_low: numbers[0] ?? "", entity_high: numbers[1] ?? "" };
  };
  var computePairName = (hass, lower, upper) => {
    const nameOf = (stateObj) => hass.formatEntityName(stateObj, void 0) || stateObj.attributes.friendly_name || stateObj.entity_id;
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

  // node_modules/@lit/reactive-element/css-tag.js
  var t = globalThis;
  var e = t.ShadowRoot && (void 0 === t.ShadyCSS || t.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype;
  var s = /* @__PURE__ */ Symbol();
  var o = /* @__PURE__ */ new WeakMap();
  var n = class {
    constructor(t5, e7, o8) {
      if (this._$cssResult$ = true, o8 !== s) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
      this.cssText = t5, this.t = e7;
    }
    get styleSheet() {
      let t5 = this.o;
      const s5 = this.t;
      if (e && void 0 === t5) {
        const e7 = void 0 !== s5 && 1 === s5.length;
        e7 && (t5 = o.get(s5)), void 0 === t5 && ((this.o = t5 = new CSSStyleSheet()).replaceSync(this.cssText), e7 && o.set(s5, t5));
      }
      return t5;
    }
    toString() {
      return this.cssText;
    }
  };
  var r = (t5) => new n("string" == typeof t5 ? t5 : t5 + "", void 0, s);
  var i = (t5, ...e7) => {
    const o8 = 1 === t5.length ? t5[0] : e7.reduce((e8, s5, o9) => e8 + ((t6) => {
      if (true === t6._$cssResult$) return t6.cssText;
      if ("number" == typeof t6) return t6;
      throw Error("Value passed to 'css' function must be a 'css' function result: " + t6 + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
    })(s5) + t5[o9 + 1], t5[0]);
    return new n(o8, t5, s);
  };
  var S = (s5, o8) => {
    if (e) s5.adoptedStyleSheets = o8.map((t5) => t5 instanceof CSSStyleSheet ? t5 : t5.styleSheet);
    else for (const e7 of o8) {
      const o9 = document.createElement("style"), n7 = t.litNonce;
      void 0 !== n7 && o9.setAttribute("nonce", n7), o9.textContent = e7.cssText, s5.appendChild(o9);
    }
  };
  var c = e ? (t5) => t5 : (t5) => t5 instanceof CSSStyleSheet ? ((t6) => {
    let e7 = "";
    for (const s5 of t6.cssRules) e7 += s5.cssText;
    return r(e7);
  })(t5) : t5;

  // node_modules/@lit/reactive-element/reactive-element.js
  var { is: i2, defineProperty: e2, getOwnPropertyDescriptor: h, getOwnPropertyNames: r2, getOwnPropertySymbols: o2, getPrototypeOf: n2 } = Object;
  var a = globalThis;
  var c2 = a.trustedTypes;
  var l = c2 ? c2.emptyScript : "";
  var p = a.reactiveElementPolyfillSupport;
  var d = (t5, s5) => t5;
  var u = { toAttribute(t5, s5) {
    switch (s5) {
      case Boolean:
        t5 = t5 ? l : null;
        break;
      case Object:
      case Array:
        t5 = null == t5 ? t5 : JSON.stringify(t5);
    }
    return t5;
  }, fromAttribute(t5, s5) {
    let i6 = t5;
    switch (s5) {
      case Boolean:
        i6 = null !== t5;
        break;
      case Number:
        i6 = null === t5 ? null : Number(t5);
        break;
      case Object:
      case Array:
        try {
          i6 = JSON.parse(t5);
        } catch (t6) {
          i6 = null;
        }
    }
    return i6;
  } };
  var f = (t5, s5) => !i2(t5, s5);
  var b = { attribute: true, type: String, converter: u, reflect: false, useDefault: false, hasChanged: f };
  Symbol.metadata ??= /* @__PURE__ */ Symbol("metadata"), a.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
  var y = class extends HTMLElement {
    static addInitializer(t5) {
      this._$Ei(), (this.l ??= []).push(t5);
    }
    static get observedAttributes() {
      return this.finalize(), this._$Eh && [...this._$Eh.keys()];
    }
    static createProperty(t5, s5 = b) {
      if (s5.state && (s5.attribute = false), this._$Ei(), this.prototype.hasOwnProperty(t5) && ((s5 = Object.create(s5)).wrapped = true), this.elementProperties.set(t5, s5), !s5.noAccessor) {
        const i6 = /* @__PURE__ */ Symbol(), h4 = this.getPropertyDescriptor(t5, i6, s5);
        void 0 !== h4 && e2(this.prototype, t5, h4);
      }
    }
    static getPropertyDescriptor(t5, s5, i6) {
      const { get: e7, set: r8 } = h(this.prototype, t5) ?? { get() {
        return this[s5];
      }, set(t6) {
        this[s5] = t6;
      } };
      return { get: e7, set(s6) {
        const h4 = e7?.call(this);
        r8?.call(this, s6), this.requestUpdate(t5, h4, i6);
      }, configurable: true, enumerable: true };
    }
    static getPropertyOptions(t5) {
      return this.elementProperties.get(t5) ?? b;
    }
    static _$Ei() {
      if (this.hasOwnProperty(d("elementProperties"))) return;
      const t5 = n2(this);
      t5.finalize(), void 0 !== t5.l && (this.l = [...t5.l]), this.elementProperties = new Map(t5.elementProperties);
    }
    static finalize() {
      if (this.hasOwnProperty(d("finalized"))) return;
      if (this.finalized = true, this._$Ei(), this.hasOwnProperty(d("properties"))) {
        const t6 = this.properties, s5 = [...r2(t6), ...o2(t6)];
        for (const i6 of s5) this.createProperty(i6, t6[i6]);
      }
      const t5 = this[Symbol.metadata];
      if (null !== t5) {
        const s5 = litPropertyMetadata.get(t5);
        if (void 0 !== s5) for (const [t6, i6] of s5) this.elementProperties.set(t6, i6);
      }
      this._$Eh = /* @__PURE__ */ new Map();
      for (const [t6, s5] of this.elementProperties) {
        const i6 = this._$Eu(t6, s5);
        void 0 !== i6 && this._$Eh.set(i6, t6);
      }
      this.elementStyles = this.finalizeStyles(this.styles);
    }
    static finalizeStyles(s5) {
      const i6 = [];
      if (Array.isArray(s5)) {
        const e7 = new Set(s5.flat(1 / 0).reverse());
        for (const s6 of e7) i6.unshift(c(s6));
      } else void 0 !== s5 && i6.push(c(s5));
      return i6;
    }
    static _$Eu(t5, s5) {
      const i6 = s5.attribute;
      return false === i6 ? void 0 : "string" == typeof i6 ? i6 : "string" == typeof t5 ? t5.toLowerCase() : void 0;
    }
    constructor() {
      super(), this._$Ep = void 0, this.isUpdatePending = false, this.hasUpdated = false, this._$Em = null, this._$Ev();
    }
    _$Ev() {
      this._$ES = new Promise((t5) => this.enableUpdating = t5), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), this.constructor.l?.forEach((t5) => t5(this));
    }
    addController(t5) {
      (this._$EO ??= /* @__PURE__ */ new Set()).add(t5), void 0 !== this.renderRoot && this.isConnected && t5.hostConnected?.();
    }
    removeController(t5) {
      this._$EO?.delete(t5);
    }
    _$E_() {
      const t5 = /* @__PURE__ */ new Map(), s5 = this.constructor.elementProperties;
      for (const i6 of s5.keys()) this.hasOwnProperty(i6) && (t5.set(i6, this[i6]), delete this[i6]);
      t5.size > 0 && (this._$Ep = t5);
    }
    createRenderRoot() {
      const t5 = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
      return S(t5, this.constructor.elementStyles), t5;
    }
    connectedCallback() {
      this.renderRoot ??= this.createRenderRoot(), this.enableUpdating(true), this._$EO?.forEach((t5) => t5.hostConnected?.());
    }
    enableUpdating(t5) {
    }
    disconnectedCallback() {
      this._$EO?.forEach((t5) => t5.hostDisconnected?.());
    }
    attributeChangedCallback(t5, s5, i6) {
      this._$AK(t5, i6);
    }
    _$ET(t5, s5) {
      const i6 = this.constructor.elementProperties.get(t5), e7 = this.constructor._$Eu(t5, i6);
      if (void 0 !== e7 && true === i6.reflect) {
        const h4 = (void 0 !== i6.converter?.toAttribute ? i6.converter : u).toAttribute(s5, i6.type);
        this._$Em = t5, null == h4 ? this.removeAttribute(e7) : this.setAttribute(e7, h4), this._$Em = null;
      }
    }
    _$AK(t5, s5) {
      const i6 = this.constructor, e7 = i6._$Eh.get(t5);
      if (void 0 !== e7 && this._$Em !== e7) {
        const t6 = i6.getPropertyOptions(e7), h4 = "function" == typeof t6.converter ? { fromAttribute: t6.converter } : void 0 !== t6.converter?.fromAttribute ? t6.converter : u;
        this._$Em = e7;
        const r8 = h4.fromAttribute(s5, t6.type);
        this[e7] = r8 ?? this._$Ej?.get(e7) ?? r8, this._$Em = null;
      }
    }
    requestUpdate(t5, s5, i6, e7 = false, h4) {
      if (void 0 !== t5) {
        const r8 = this.constructor;
        if (false === e7 && (h4 = this[t5]), i6 ??= r8.getPropertyOptions(t5), !((i6.hasChanged ?? f)(h4, s5) || i6.useDefault && i6.reflect && h4 === this._$Ej?.get(t5) && !this.hasAttribute(r8._$Eu(t5, i6)))) return;
        this.C(t5, s5, i6);
      }
      false === this.isUpdatePending && (this._$ES = this._$EP());
    }
    C(t5, s5, { useDefault: i6, reflect: e7, wrapped: h4 }, r8) {
      i6 && !(this._$Ej ??= /* @__PURE__ */ new Map()).has(t5) && (this._$Ej.set(t5, r8 ?? s5 ?? this[t5]), true !== h4 || void 0 !== r8) || (this._$AL.has(t5) || (this.hasUpdated || i6 || (s5 = void 0), this._$AL.set(t5, s5)), true === e7 && this._$Em !== t5 && (this._$Eq ??= /* @__PURE__ */ new Set()).add(t5));
    }
    async _$EP() {
      this.isUpdatePending = true;
      try {
        await this._$ES;
      } catch (t6) {
        Promise.reject(t6);
      }
      const t5 = this.scheduleUpdate();
      return null != t5 && await t5, !this.isUpdatePending;
    }
    scheduleUpdate() {
      return this.performUpdate();
    }
    performUpdate() {
      if (!this.isUpdatePending) return;
      if (!this.hasUpdated) {
        if (this.renderRoot ??= this.createRenderRoot(), this._$Ep) {
          for (const [t7, s6] of this._$Ep) this[t7] = s6;
          this._$Ep = void 0;
        }
        const t6 = this.constructor.elementProperties;
        if (t6.size > 0) for (const [s6, i6] of t6) {
          const { wrapped: t7 } = i6, e7 = this[s6];
          true !== t7 || this._$AL.has(s6) || void 0 === e7 || this.C(s6, void 0, i6, e7);
        }
      }
      let t5 = false;
      const s5 = this._$AL;
      try {
        t5 = this.shouldUpdate(s5), t5 ? (this.willUpdate(s5), this._$EO?.forEach((t6) => t6.hostUpdate?.()), this.update(s5)) : this._$EM();
      } catch (s6) {
        throw t5 = false, this._$EM(), s6;
      }
      t5 && this._$AE(s5);
    }
    willUpdate(t5) {
    }
    _$AE(t5) {
      this._$EO?.forEach((t6) => t6.hostUpdated?.()), this.hasUpdated || (this.hasUpdated = true, this.firstUpdated(t5)), this.updated(t5);
    }
    _$EM() {
      this._$AL = /* @__PURE__ */ new Map(), this.isUpdatePending = false;
    }
    get updateComplete() {
      return this.getUpdateComplete();
    }
    getUpdateComplete() {
      return this._$ES;
    }
    shouldUpdate(t5) {
      return true;
    }
    update(t5) {
      this._$Eq &&= this._$Eq.forEach((t6) => this._$ET(t6, this[t6])), this._$EM();
    }
    updated(t5) {
    }
    firstUpdated(t5) {
    }
  };
  y.elementStyles = [], y.shadowRootOptions = { mode: "open" }, y[d("elementProperties")] = /* @__PURE__ */ new Map(), y[d("finalized")] = /* @__PURE__ */ new Map(), p?.({ ReactiveElement: y }), (a.reactiveElementVersions ??= []).push("2.1.2");

  // node_modules/lit-html/lit-html.js
  var t2 = globalThis;
  var i3 = (t5) => t5;
  var s2 = t2.trustedTypes;
  var e3 = s2 ? s2.createPolicy("lit-html", { createHTML: (t5) => t5 }) : void 0;
  var h2 = "$lit$";
  var o3 = `lit$${Math.random().toFixed(9).slice(2)}$`;
  var n3 = "?" + o3;
  var r3 = `<${n3}>`;
  var l2 = document;
  var c3 = () => l2.createComment("");
  var a2 = (t5) => null === t5 || "object" != typeof t5 && "function" != typeof t5;
  var u2 = Array.isArray;
  var d2 = (t5) => u2(t5) || "function" == typeof t5?.[Symbol.iterator];
  var f2 = "[ 	\n\f\r]";
  var v = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g;
  var _ = /-->/g;
  var m = />/g;
  var p2 = RegExp(`>|${f2}(?:([^\\s"'>=/]+)(${f2}*=${f2}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g");
  var g = /'/g;
  var $ = /"/g;
  var y2 = /^(?:script|style|textarea|title)$/i;
  var x = (t5) => (i6, ...s5) => ({ _$litType$: t5, strings: i6, values: s5 });
  var b2 = x(1);
  var w = x(2);
  var T = x(3);
  var E = /* @__PURE__ */ Symbol.for("lit-noChange");
  var A = /* @__PURE__ */ Symbol.for("lit-nothing");
  var C = /* @__PURE__ */ new WeakMap();
  var P = l2.createTreeWalker(l2, 129);
  function V(t5, i6) {
    if (!u2(t5) || !t5.hasOwnProperty("raw")) throw Error("invalid template strings array");
    return void 0 !== e3 ? e3.createHTML(i6) : i6;
  }
  var N = (t5, i6) => {
    const s5 = t5.length - 1, e7 = [];
    let n7, l3 = 2 === i6 ? "<svg>" : 3 === i6 ? "<math>" : "", c5 = v;
    for (let i7 = 0; i7 < s5; i7++) {
      const s6 = t5[i7];
      let a3, u3, d3 = -1, f4 = 0;
      for (; f4 < s6.length && (c5.lastIndex = f4, u3 = c5.exec(s6), null !== u3); ) f4 = c5.lastIndex, c5 === v ? "!--" === u3[1] ? c5 = _ : void 0 !== u3[1] ? c5 = m : void 0 !== u3[2] ? (y2.test(u3[2]) && (n7 = RegExp("</" + u3[2], "g")), c5 = p2) : void 0 !== u3[3] && (c5 = p2) : c5 === p2 ? ">" === u3[0] ? (c5 = n7 ?? v, d3 = -1) : void 0 === u3[1] ? d3 = -2 : (d3 = c5.lastIndex - u3[2].length, a3 = u3[1], c5 = void 0 === u3[3] ? p2 : '"' === u3[3] ? $ : g) : c5 === $ || c5 === g ? c5 = p2 : c5 === _ || c5 === m ? c5 = v : (c5 = p2, n7 = void 0);
      const x2 = c5 === p2 && t5[i7 + 1].startsWith("/>") ? " " : "";
      l3 += c5 === v ? s6 + r3 : d3 >= 0 ? (e7.push(a3), s6.slice(0, d3) + h2 + s6.slice(d3) + o3 + x2) : s6 + o3 + (-2 === d3 ? i7 : x2);
    }
    return [V(t5, l3 + (t5[s5] || "<?>") + (2 === i6 ? "</svg>" : 3 === i6 ? "</math>" : "")), e7];
  };
  var S2 = class _S {
    constructor({ strings: t5, _$litType$: i6 }, e7) {
      let r8;
      this.parts = [];
      let l3 = 0, a3 = 0;
      const u3 = t5.length - 1, d3 = this.parts, [f4, v2] = N(t5, i6);
      if (this.el = _S.createElement(f4, e7), P.currentNode = this.el.content, 2 === i6 || 3 === i6) {
        const t6 = this.el.content.firstChild;
        t6.replaceWith(...t6.childNodes);
      }
      for (; null !== (r8 = P.nextNode()) && d3.length < u3; ) {
        if (1 === r8.nodeType) {
          if (r8.hasAttributes()) for (const t6 of r8.getAttributeNames()) if (t6.endsWith(h2)) {
            const i7 = v2[a3++], s5 = r8.getAttribute(t6).split(o3), e8 = /([.?@])?(.*)/.exec(i7);
            d3.push({ type: 1, index: l3, name: e8[2], strings: s5, ctor: "." === e8[1] ? I : "?" === e8[1] ? L : "@" === e8[1] ? z : H }), r8.removeAttribute(t6);
          } else t6.startsWith(o3) && (d3.push({ type: 6, index: l3 }), r8.removeAttribute(t6));
          if (y2.test(r8.tagName)) {
            const t6 = r8.textContent.split(o3), i7 = t6.length - 1;
            if (i7 > 0) {
              r8.textContent = s2 ? s2.emptyScript : "";
              for (let s5 = 0; s5 < i7; s5++) r8.append(t6[s5], c3()), P.nextNode(), d3.push({ type: 2, index: ++l3 });
              r8.append(t6[i7], c3());
            }
          }
        } else if (8 === r8.nodeType) if (r8.data === n3) d3.push({ type: 2, index: l3 });
        else {
          let t6 = -1;
          for (; -1 !== (t6 = r8.data.indexOf(o3, t6 + 1)); ) d3.push({ type: 7, index: l3 }), t6 += o3.length - 1;
        }
        l3++;
      }
    }
    static createElement(t5, i6) {
      const s5 = l2.createElement("template");
      return s5.innerHTML = t5, s5;
    }
  };
  function M(t5, i6, s5 = t5, e7) {
    if (i6 === E) return i6;
    let h4 = void 0 !== e7 ? s5._$Co?.[e7] : s5._$Cl;
    const o8 = a2(i6) ? void 0 : i6._$litDirective$;
    return h4?.constructor !== o8 && (h4?._$AO?.(false), void 0 === o8 ? h4 = void 0 : (h4 = new o8(t5), h4._$AT(t5, s5, e7)), void 0 !== e7 ? (s5._$Co ??= [])[e7] = h4 : s5._$Cl = h4), void 0 !== h4 && (i6 = M(t5, h4._$AS(t5, i6.values), h4, e7)), i6;
  }
  var R = class {
    constructor(t5, i6) {
      this._$AV = [], this._$AN = void 0, this._$AD = t5, this._$AM = i6;
    }
    get parentNode() {
      return this._$AM.parentNode;
    }
    get _$AU() {
      return this._$AM._$AU;
    }
    u(t5) {
      const { el: { content: i6 }, parts: s5 } = this._$AD, e7 = (t5?.creationScope ?? l2).importNode(i6, true);
      P.currentNode = e7;
      let h4 = P.nextNode(), o8 = 0, n7 = 0, r8 = s5[0];
      for (; void 0 !== r8; ) {
        if (o8 === r8.index) {
          let i7;
          2 === r8.type ? i7 = new k(h4, h4.nextSibling, this, t5) : 1 === r8.type ? i7 = new r8.ctor(h4, r8.name, r8.strings, this, t5) : 6 === r8.type && (i7 = new Z(h4, this, t5)), this._$AV.push(i7), r8 = s5[++n7];
        }
        o8 !== r8?.index && (h4 = P.nextNode(), o8++);
      }
      return P.currentNode = l2, e7;
    }
    p(t5) {
      let i6 = 0;
      for (const s5 of this._$AV) void 0 !== s5 && (void 0 !== s5.strings ? (s5._$AI(t5, s5, i6), i6 += s5.strings.length - 2) : s5._$AI(t5[i6])), i6++;
    }
  };
  var k = class _k {
    get _$AU() {
      return this._$AM?._$AU ?? this._$Cv;
    }
    constructor(t5, i6, s5, e7) {
      this.type = 2, this._$AH = A, this._$AN = void 0, this._$AA = t5, this._$AB = i6, this._$AM = s5, this.options = e7, this._$Cv = e7?.isConnected ?? true;
    }
    get parentNode() {
      let t5 = this._$AA.parentNode;
      const i6 = this._$AM;
      return void 0 !== i6 && 11 === t5?.nodeType && (t5 = i6.parentNode), t5;
    }
    get startNode() {
      return this._$AA;
    }
    get endNode() {
      return this._$AB;
    }
    _$AI(t5, i6 = this) {
      t5 = M(this, t5, i6), a2(t5) ? t5 === A || null == t5 || "" === t5 ? (this._$AH !== A && this._$AR(), this._$AH = A) : t5 !== this._$AH && t5 !== E && this._(t5) : void 0 !== t5._$litType$ ? this.$(t5) : void 0 !== t5.nodeType ? this.T(t5) : d2(t5) ? this.k(t5) : this._(t5);
    }
    O(t5) {
      return this._$AA.parentNode.insertBefore(t5, this._$AB);
    }
    T(t5) {
      this._$AH !== t5 && (this._$AR(), this._$AH = this.O(t5));
    }
    _(t5) {
      this._$AH !== A && a2(this._$AH) ? this._$AA.nextSibling.data = t5 : this.T(l2.createTextNode(t5)), this._$AH = t5;
    }
    $(t5) {
      const { values: i6, _$litType$: s5 } = t5, e7 = "number" == typeof s5 ? this._$AC(t5) : (void 0 === s5.el && (s5.el = S2.createElement(V(s5.h, s5.h[0]), this.options)), s5);
      if (this._$AH?._$AD === e7) this._$AH.p(i6);
      else {
        const t6 = new R(e7, this), s6 = t6.u(this.options);
        t6.p(i6), this.T(s6), this._$AH = t6;
      }
    }
    _$AC(t5) {
      let i6 = C.get(t5.strings);
      return void 0 === i6 && C.set(t5.strings, i6 = new S2(t5)), i6;
    }
    k(t5) {
      u2(this._$AH) || (this._$AH = [], this._$AR());
      const i6 = this._$AH;
      let s5, e7 = 0;
      for (const h4 of t5) e7 === i6.length ? i6.push(s5 = new _k(this.O(c3()), this.O(c3()), this, this.options)) : s5 = i6[e7], s5._$AI(h4), e7++;
      e7 < i6.length && (this._$AR(s5 && s5._$AB.nextSibling, e7), i6.length = e7);
    }
    _$AR(t5 = this._$AA.nextSibling, s5) {
      for (this._$AP?.(false, true, s5); t5 !== this._$AB; ) {
        const s6 = i3(t5).nextSibling;
        i3(t5).remove(), t5 = s6;
      }
    }
    setConnected(t5) {
      void 0 === this._$AM && (this._$Cv = t5, this._$AP?.(t5));
    }
  };
  var H = class {
    get tagName() {
      return this.element.tagName;
    }
    get _$AU() {
      return this._$AM._$AU;
    }
    constructor(t5, i6, s5, e7, h4) {
      this.type = 1, this._$AH = A, this._$AN = void 0, this.element = t5, this.name = i6, this._$AM = e7, this.options = h4, s5.length > 2 || "" !== s5[0] || "" !== s5[1] ? (this._$AH = Array(s5.length - 1).fill(new String()), this.strings = s5) : this._$AH = A;
    }
    _$AI(t5, i6 = this, s5, e7) {
      const h4 = this.strings;
      let o8 = false;
      if (void 0 === h4) t5 = M(this, t5, i6, 0), o8 = !a2(t5) || t5 !== this._$AH && t5 !== E, o8 && (this._$AH = t5);
      else {
        const e8 = t5;
        let n7, r8;
        for (t5 = h4[0], n7 = 0; n7 < h4.length - 1; n7++) r8 = M(this, e8[s5 + n7], i6, n7), r8 === E && (r8 = this._$AH[n7]), o8 ||= !a2(r8) || r8 !== this._$AH[n7], r8 === A ? t5 = A : t5 !== A && (t5 += (r8 ?? "") + h4[n7 + 1]), this._$AH[n7] = r8;
      }
      o8 && !e7 && this.j(t5);
    }
    j(t5) {
      t5 === A ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t5 ?? "");
    }
  };
  var I = class extends H {
    constructor() {
      super(...arguments), this.type = 3;
    }
    j(t5) {
      this.element[this.name] = t5 === A ? void 0 : t5;
    }
  };
  var L = class extends H {
    constructor() {
      super(...arguments), this.type = 4;
    }
    j(t5) {
      this.element.toggleAttribute(this.name, !!t5 && t5 !== A);
    }
  };
  var z = class extends H {
    constructor(t5, i6, s5, e7, h4) {
      super(t5, i6, s5, e7, h4), this.type = 5;
    }
    _$AI(t5, i6 = this) {
      if ((t5 = M(this, t5, i6, 0) ?? A) === E) return;
      const s5 = this._$AH, e7 = t5 === A && s5 !== A || t5.capture !== s5.capture || t5.once !== s5.once || t5.passive !== s5.passive, h4 = t5 !== A && (s5 === A || e7);
      e7 && this.element.removeEventListener(this.name, this, s5), h4 && this.element.addEventListener(this.name, this, t5), this._$AH = t5;
    }
    handleEvent(t5) {
      "function" == typeof this._$AH ? this._$AH.call(this.options?.host ?? this.element, t5) : this._$AH.handleEvent(t5);
    }
  };
  var Z = class {
    constructor(t5, i6, s5) {
      this.element = t5, this.type = 6, this._$AN = void 0, this._$AM = i6, this.options = s5;
    }
    get _$AU() {
      return this._$AM._$AU;
    }
    _$AI(t5) {
      M(this, t5);
    }
  };
  var j = { M: h2, P: o3, A: n3, C: 1, L: N, R, D: d2, V: M, I: k, H, N: L, U: z, B: I, F: Z };
  var B = t2.litHtmlPolyfillSupport;
  B?.(S2, k), (t2.litHtmlVersions ??= []).push("3.3.3");
  var D = (t5, i6, s5) => {
    const e7 = s5?.renderBefore ?? i6;
    let h4 = e7._$litPart$;
    if (void 0 === h4) {
      const t6 = s5?.renderBefore ?? null;
      e7._$litPart$ = h4 = new k(i6.insertBefore(c3(), t6), t6, void 0, s5 ?? {});
    }
    return h4._$AI(t5), h4;
  };

  // node_modules/lit-element/lit-element.js
  var s3 = globalThis;
  var i4 = class extends y {
    constructor() {
      super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
    }
    createRenderRoot() {
      const t5 = super.createRenderRoot();
      return this.renderOptions.renderBefore ??= t5.firstChild, t5;
    }
    update(t5) {
      const r8 = this.render();
      this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t5), this._$Do = D(r8, this.renderRoot, this.renderOptions);
    }
    connectedCallback() {
      super.connectedCallback(), this._$Do?.setConnected(true);
    }
    disconnectedCallback() {
      super.disconnectedCallback(), this._$Do?.setConnected(false);
    }
    render() {
      return E;
    }
  };
  i4._$litElement$ = true, i4["finalized"] = true, s3.litElementHydrateSupport?.({ LitElement: i4 });
  var o4 = s3.litElementPolyfillSupport;
  o4?.({ LitElement: i4 });
  (s3.litElementVersions ??= []).push("4.2.2");

  // node_modules/@lit/reactive-element/decorators/property.js
  var o5 = { attribute: true, type: String, converter: u, reflect: false, hasChanged: f };
  var r4 = (t5 = o5, e7, r8) => {
    const { kind: n7, metadata: i6 } = r8;
    let s5 = globalThis.litPropertyMetadata.get(i6);
    if (void 0 === s5 && globalThis.litPropertyMetadata.set(i6, s5 = /* @__PURE__ */ new Map()), "setter" === n7 && ((t5 = Object.create(t5)).wrapped = true), s5.set(r8.name, t5), "accessor" === n7) {
      const { name: o8 } = r8;
      return { set(r9) {
        const n8 = e7.get.call(this);
        e7.set.call(this, r9), this.requestUpdate(o8, n8, t5, true, r9);
      }, init(e8) {
        return void 0 !== e8 && this.C(o8, void 0, t5, e8), e8;
      } };
    }
    if ("setter" === n7) {
      const { name: o8 } = r8;
      return function(r9) {
        const n8 = this[o8];
        e7.call(this, r9), this.requestUpdate(o8, n8, t5, true, r9);
      };
    }
    throw Error("Unsupported decorator location: " + n7);
  };
  function n4(t5) {
    return (e7, o8) => "object" == typeof o8 ? r4(t5, e7, o8) : ((t6, e8, o9) => {
      const r8 = e8.hasOwnProperty(o9);
      return e8.constructor.createProperty(o9, t6), r8 ? Object.getOwnPropertyDescriptor(e8, o9) : void 0;
    })(t5, e7, o8);
  }

  // node_modules/@lit/reactive-element/decorators/state.js
  function r5(r8) {
    return n4({ ...r8, state: true, attribute: false });
  }

  // src/i18n/da.json
  var da_default = {
    card: {
      description: "En skyder med to håndtag, der sætter en nedre og en øvre entitet med tal, dato eller tid."
    },
    label: {
      entity_low: "Entitet for den nedre værdi",
      entity_high: "Entitet for den øvre værdi",
      min: "Laveste værdi på skyderen",
      max: "Højeste værdi på skyderen",
      step: "Trin",
      show: "Viste værdier",
      position: "Hvor værdierne vises",
      full_width: "Skyder i fuld bredde",
      small: "Lille tekst til værdierne",
      push: "Skub det andet håndtag",
      slider: "Skyder"
    },
    helper: {
      entity_low: "Håndtaget for den nedre værdi ændrer denne entitet.",
      entity_high: "Håndtaget for den øvre værdi ændrer denne entitet.",
      min: "Lad feltet stå tomt for standard. Tider som 06:00, datoer som 2026-10-01 eller +7d.",
      max: "Lad feltet stå tomt for standard. Tider som 22:00, datoer som 2026-12-31 eller +30d.",
      step: "Lad feltet stå tomt for standard. For tider i minutter, for datoer i dage.",
      unit: "Til tal. Lad feltet stå tomt for at bruge entitetens egen enhed.",
      position: "Som standard vises tal ved siden af skyderen, datoer og tider under den.",
      full_width: "Skyderen bruger også pladsen ved siden af. Værdier ved siden af skyderen flyttes ned under den.",
      small: "Viser værdierne med mindre tekst.",
      push: "Når den er slået fra, stopper et håndtag ved det andet."
    },
    show: {
      both: "Begge værdier (standard)",
      low: "Nedre værdi",
      high: "Øvre værdi",
      none: "Ingen værdi"
    },
    position: {
      inline: "Ved siden af skyderen",
      below: "Under skyderen"
    },
    warning: {
      bad_range: "Den laveste værdi på skyderen skal være under den højeste værdi.",
      bad_limit: "Den laveste eller højeste værdi på skyderen er ikke en gyldig dato eller tid.",
      mixed_kinds: "Begge entiteter skal have samme slags værdi: tal, tider, datoer eller datoer med tid."
    }
  };

  // src/i18n/de.json
  var de_default = {
    card: {
      description: "Ein Schieberegler mit zwei Reglern, der eine untere und eine obere Entität mit Zahl, Datum oder Uhrzeit setzt."
    },
    label: {
      entity_low: "Entität für den unteren Wert",
      entity_high: "Entität für den oberen Wert",
      min: "Niedrigster Wert auf dem Schieberegler",
      max: "Höchster Wert auf dem Schieberegler",
      step: "Schrittweite",
      show: "Angezeigte Werte",
      position: "Position der Werte",
      full_width: "Schieberegler in voller Breite",
      small: "Kleine Schrift für die Werte",
      push: "Anderen Regler mitschieben",
      slider: "Schieberegler"
    },
    helper: {
      entity_low: "Der Regler für den unteren Wert ändert diese Entität.",
      entity_high: "Der Regler für den oberen Wert ändert diese Entität.",
      min: "Leer lassen für den Standardwert. Uhrzeiten wie 06:00, Datumsangaben wie 2026-10-01 oder +7d.",
      max: "Leer lassen für den Standardwert. Uhrzeiten wie 22:00, Datumsangaben wie 2026-12-31 oder +30d.",
      step: "Leer lassen für den Standardwert. Bei Uhrzeiten in Minuten, bei Datumsangaben in Tagen.",
      unit: "Für Zahlen. Leer lassen, um die Einheit der Entität zu verwenden.",
      position: "Standardmäßig stehen Zahlen neben dem Schieberegler, Datum und Uhrzeit darunter.",
      full_width: "Der Schieberegler nutzt auch den Platz daneben. Werte neben dem Schieberegler werden darunter verschoben.",
      small: "Zeigt die Werte in kleinerer Schrift.",
      push: "Wenn ausgeschaltet, stoppt ein Regler am anderen Regler."
    },
    show: {
      both: "Beide Werte (Standard)",
      low: "Unterer Wert",
      high: "Oberer Wert",
      none: "Kein Wert"
    },
    position: {
      inline: "Neben dem Schieberegler",
      below: "Unter dem Schieberegler"
    },
    warning: {
      bad_range: "Der niedrigste Wert auf dem Schieberegler muss unter dem höchsten Wert liegen.",
      bad_limit: "Der niedrigste oder höchste Wert auf dem Schieberegler ist weder ein gültiges Datum noch eine gültige Uhrzeit.",
      mixed_kinds: "Beide Entitäten müssen dieselbe Art von Wert haben: Zahl, Uhrzeit, Datum oder Datum mit Uhrzeit."
    }
  };

  // src/i18n/en.json
  var en_default = {
    card: {
      description: "A slider with two handles that sets a lower and an upper number, date, or time entity."
    },
    label: {
      entity_low: "Entity for the lower value",
      entity_high: "Entity for the upper value",
      min: "Lowest value on the slider",
      max: "Highest value on the slider",
      step: "Step",
      show: "Values to show",
      position: "Where to show the values",
      full_width: "Full width slider",
      small: "Small text for the values",
      push: "Push the other handle",
      slider: "Slider"
    },
    helper: {
      entity_low: "The handle for the lower value sets this entity.",
      entity_high: "The handle for the upper value sets this entity.",
      min: "Leave empty for the default. Times like 06:00, dates like 2026-10-01 or +7d.",
      max: "Leave empty for the default. Times like 22:00, dates like 2026-12-31 or +30d.",
      step: "Leave empty for the default. For times in minutes, for dates in days.",
      unit: "For numbers. Leave empty to use the entity's own unit.",
      position: "By default numbers show next to the slider, dates and times below it.",
      full_width: "The slider also uses the space next to it. Values next to the slider move below it.",
      small: "Shows the values in smaller text.",
      push: "When off, a handle stops at the other handle."
    },
    show: {
      both: "Both values (default)",
      low: "Lower value",
      high: "Upper value",
      none: "No value"
    },
    position: {
      inline: "Next to the slider",
      below: "Below the slider"
    },
    warning: {
      bad_range: "The lowest value on the slider must be below the highest value.",
      bad_limit: "The lowest or highest value on the slider is not a valid date or time.",
      mixed_kinds: "Both entities must hold the same kind of value: numbers, times, dates, or dates with times."
    }
  };

  // src/i18n/es.json
  var es_default = {
    card: {
      description: "Un control deslizante con dos controles que ajusta una entidad inferior y otra superior de número, fecha u hora."
    },
    label: {
      entity_low: "Entidad para el valor inferior",
      entity_high: "Entidad para el valor superior",
      min: "Valor más bajo del control deslizante",
      max: "Valor más alto del control deslizante",
      step: "Tamaño del paso",
      show: "Valores a mostrar",
      position: "Posición de los valores",
      full_width: "Control deslizante de ancho completo",
      small: "Texto pequeño para los valores",
      push: "Empujar el otro control",
      slider: "Control deslizante"
    },
    helper: {
      entity_low: "El control del valor inferior cambia esta entidad.",
      entity_high: "El control del valor superior cambia esta entidad.",
      min: "Déjalo vacío para usar el valor predeterminado. Horas como 06:00, fechas como 2026-10-01 o +7d.",
      max: "Déjalo vacío para usar el valor predeterminado. Horas como 22:00, fechas como 2026-12-31 o +30d.",
      step: "Déjalo vacío para usar el valor predeterminado. En minutos para las horas y en días para las fechas.",
      unit: "Para números. Déjalo vacío para usar la unidad de la entidad.",
      position: "Por defecto, los números se muestran junto al control deslizante y las fechas y horas, debajo.",
      full_width: "El control deslizante también usa el espacio de al lado. Los valores junto al control deslizante pasan debajo.",
      small: "Muestra los valores con un texto más pequeño.",
      push: "Si está desactivado, un control se detiene al llegar al otro."
    },
    show: {
      both: "Ambos valores (predeterminado)",
      low: "Valor inferior",
      high: "Valor superior",
      none: "Ningún valor"
    },
    position: {
      inline: "Junto al control deslizante",
      below: "Debajo del control deslizante"
    },
    warning: {
      bad_range: "El valor más bajo del control deslizante debe ser menor que el valor más alto.",
      bad_limit: "El valor más bajo o más alto del control deslizante no es una fecha ni una hora válida.",
      mixed_kinds: "Ambas entidades deben tener el mismo tipo de valor: número, hora, fecha o fecha con hora."
    }
  };

  // src/i18n/index.ts
  var TRANSLATIONS = { da: da_default, de: de_default, en: en_default, es: es_default };
  var find = (translation, key) => {
    let found = translation;
    for (const part of key.split(".")) {
      found = found?.[part];
    }
    return typeof found === "string" ? found : void 0;
  };
  var hasTranslation = (key) => find(en_default, key) !== void 0;
  var translate = (key, language) => find(TRANSLATIONS[language.split("-")[0]], key) ?? find(en_default, key) ?? key;
  var languageOf = (hass) => hass?.locale.language ?? hass?.language ?? document.documentElement.lang;

  // src/editor-schema.ts
  var selectSelector = (options, group, language) => ({
    select: {
      mode: "dropdown",
      options: options.map((value) => ({ value, label: translate(`${group}.${value}`, language) }))
    }
  });
  var buildSchema = ({ language, defaults, defaultName, fullWidth }) => {
    const entity = { entity: { filter: { domain: DOMAINS } } };
    return [
      { name: "entity_low", required: true, selector: entity },
      { name: "entity_high", required: true, selector: entity },
      {
        name: "content",
        type: "expandable",
        flatten: true,
        expanded: true,
        icon: "mdi:text-short",
        schema: [
          { name: "name", selector: { entity_name: { default_name: defaultName } }, context: { entity: "entity_low" } },
          {
            name: "",
            type: "grid",
            schema: [
              { name: "icon", selector: { icon: {} }, context: { icon_entity: "entity_low" } },
              { name: "color", selector: { ui_color: { include_state: true, include_none: true } } }
            ]
          },
          {
            name: "secondary_info",
            selector: { ui_state_content: { allow_context: true } },
            context: { filter_entity: "entity_low" }
          },
          { name: "show", selector: selectSelector(SHOW_OPTIONS, "show", language) },
          // A full width slider always shows the values below it.
          { name: "position", disabled: fullWidth, selector: selectSelector(POSITIONS, "position", language) },
          { name: "full_width", selector: { boolean: {} } },
          { name: "small", selector: { boolean: {} } }
        ]
      },
      {
        name: "slider",
        type: "expandable",
        flatten: true,
        icon: "mdi:tune-variant",
        schema: [
          {
            name: "",
            type: "grid",
            schema: [
              { name: "min", selector: { text: {} }, default: defaults.min },
              { name: "max", selector: { text: {} }, default: defaults.max },
              { name: "step", selector: { number: { mode: "box", step: "any", min: 0 } }, default: defaults.step },
              { name: "unit", selector: { text: {} }, default: defaults.unit }
            ]
          },
          { name: "push", selector: { boolean: {} } }
        ]
      },
      {
        name: "interactions",
        type: "expandable",
        flatten: true,
        icon: "mdi:gesture-tap",
        schema: [
          { name: "tap_action", selector: { ui_action: { default_action: "more-info" } } },
          { name: "hold_action", selector: { ui_action: { default_action: "more-info" } } },
          { name: "double_tap_action", selector: { ui_action: { default_action: "none" } } }
        ]
      }
    ];
  };

  // src/validators.ts
  var BOOLEAN_KEYS = ["full_width", "push", "small"];
  function validateEditorConfig(config) {
    if (!config || typeof config !== "object") {
      throw new Error("The settings must be a map.");
    }
    const values = config;
    for (const key of ["entity_low", "entity_high", "icon", "unit"]) {
      if (isSet(values[key]) && typeof values[key] !== "string") {
        throw new Error(`${key} must be text.`);
      }
    }
    for (const key of ["min", "max", "step"]) {
      if (isSet(values[key]) && !["string", "number"].includes(typeof values[key])) {
        throw new Error(`${key} must be a number, a date or a time.`);
      }
    }
    if (isSet(values.show) && !SHOW_OPTIONS.includes(values.show)) {
      throw new Error(`show must be one of: ${SHOW_OPTIONS.join(", ")}.`);
    }
    if (isSet(values.position) && !POSITIONS.includes(values.position)) {
      throw new Error(`position must be one of: ${POSITIONS.join(", ")}.`);
    }
    for (const key of BOOLEAN_KEYS) {
      if (isSet(values[key]) && typeof values[key] !== "boolean") {
        throw new Error(`${key} must be true or false.`);
      }
    }
  }
  function validateConfig(config) {
    validateEditorConfig(config);
    const { entity_low, entity_high } = config;
    if (!entity_low || !entity_high) {
      throw new Error("Set both entity_low and entity_high.");
    }
    if (entity_low === entity_high) {
      throw new Error("entity_low and entity_high must be two different entities.");
    }
    for (const [key, entityId] of [
      ["entity_low", entity_low],
      ["entity_high", entity_high]
    ]) {
      if (!kindsOfEntity(entityId).length) {
        throw new Error(`${key} must be one of these entity types: ${DOMAINS.join(", ")}.`);
      }
    }
    const upperKinds = kindsOfEntity(entity_high);
    const kinds = kindsOfEntity(entity_low).filter((kind) => upperKinds.includes(kind));
    if (!kinds.length) {
      throw new Error(
        "entity_low and entity_high must hold the same kind of value: numbers, times, dates, or dates with times."
      );
    }
    if (isSet(config.step) && !(Number(config.step) > 0)) {
      throw new Error("step must be a number above 0.");
    }
    if (kinds.length === 1) {
      kinds[0].validateConfig?.(config);
    }
  }

  // src/entity-range-slider-editor.ts
  var EDITOR_TAG = "entity-range-slider-editor";
  var __ready_dec, __config_dec, _hass_dec, _a, _init, _hass, __config, __ready;
  var EntityRangeSliderEditor = class extends (_a = i4, _hass_dec = [n4({ attribute: false })], __config_dec = [r5()], __ready_dec = [r5()], _a) {
    constructor() {
      super(...arguments);
      __privateAdd(this, _hass, __runInitializers(_init, 8, this)), __runInitializers(_init, 11, this);
      __privateAdd(this, __config, __runInitializers(_init, 12, this)), __runInitializers(_init, 15, this);
      __privateAdd(this, __ready, __runInitializers(_init, 16, this, false)), __runInitializers(_init, 19, this);
      __publicField(this, "_schemaKey");
      __publicField(this, "_schema");
      // The card's own texts, else Home Assistant's labels for its generic
      // fields, like its form editor for cards does.
      __publicField(this, "_computeLabel", (schema) => {
        const key = `label.${schema.name}`;
        if (hasTranslation(key)) {
          return translate(key, languageOf(this.hass));
        }
        const section = schema.name === "secondary_info" ? "entity-row" : "generic";
        return this.hass.localize(`ui.panel.lovelace.editor.card.${section}.${schema.name}`);
      });
      __publicField(this, "_computeHelper", (schema) => {
        const key = `helper.${schema.name}`;
        return hasTranslation(key) ? translate(key, languageOf(this.hass)) : void 0;
      });
    }
    setConfig(config) {
      validateEditorConfig(config);
      this._config = config;
    }
    connectedCallback() {
      super.connectedCallback();
      loadEditorElements().then(
        () => {
          this._ready = true;
        },
        () => {
        }
      );
    }
    render() {
      if (!this.hass || !this._config || !this._ready) {
        return A;
      }
      return b2`
			<ha-form
				.hass=${this.hass}
				.data=${this._config}
				.schema=${this._currentSchema(this.hass, this._config)}
				.computeLabel=${this._computeLabel}
				.computeHelper=${this._computeHelper}
				@value-changed=${this._valueChanged}
			></ha-form>
		`;
    }
    // The form changes with the language, the entities and full_width. It is
    // only built again when one of them changed, so the form keeps its state.
    _currentSchema(hass, config) {
      const lower = config.entity_low ? hass.states[config.entity_low] : void 0;
      const upper = config.entity_high ? hass.states[config.entity_high] : void 0;
      const kinds = config.entity_low ? kindsOfEntity(config.entity_low) : [];
      const kind = lower && kindOf(lower) || (kinds.length === 1 ? kinds[0] : void 0);
      const options = {
        language: languageOf(hass),
        defaults: kind?.defaults(lower, upper) ?? {},
        defaultName: lower && upper ? computePairName(hass, lower, upper) : void 0,
        fullWidth: config.full_width === true
      };
      const key = JSON.stringify(options);
      if (key !== this._schemaKey) {
        this._schemaKey = key;
        this._schema = buildSchema(options);
      }
      return this._schema;
    }
    _valueChanged(ev) {
      ev.stopPropagation();
      fireEvent(this, "config-changed", { config: ev.detail.value });
    }
  };
  _init = __decoratorStart(_a);
  _hass = new WeakMap();
  __config = new WeakMap();
  __ready = new WeakMap();
  __decorateElement(_init, 4, "hass", _hass_dec, EntityRangeSliderEditor, _hass);
  __decorateElement(_init, 4, "_config", __config_dec, EntityRangeSliderEditor, __config);
  __decorateElement(_init, 4, "_ready", __ready_dec, EntityRangeSliderEditor, __ready);
  __decoratorMetadata(_init, EntityRangeSliderEditor);

  // node_modules/lit-html/directive.js
  var t3 = { ATTRIBUTE: 1, CHILD: 2, PROPERTY: 3, BOOLEAN_ATTRIBUTE: 4, EVENT: 5, ELEMENT: 6 };
  var e5 = (t5) => (...e7) => ({ _$litDirective$: t5, values: e7 });
  var i5 = class {
    constructor(t5) {
    }
    get _$AU() {
      return this._$AM._$AU;
    }
    _$AT(t5, e7, i6) {
      this._$Ct = t5, this._$AM = e7, this._$Ci = i6;
    }
    _$AS(t5, e7) {
      return this.update(t5, e7);
    }
    update(t5, e7) {
      return this.render(...e7);
    }
  };

  // node_modules/lit-html/directives/class-map.js
  var e6 = e5(class extends i5 {
    constructor(t5) {
      if (super(t5), t5.type !== t3.ATTRIBUTE || "class" !== t5.name || t5.strings?.length > 2) throw Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.");
    }
    render(t5) {
      return " " + Object.keys(t5).filter((s5) => t5[s5]).join(" ") + " ";
    }
    update(s5, [i6]) {
      if (void 0 === this.st) {
        this.st = /* @__PURE__ */ new Set(), void 0 !== s5.strings && (this.nt = new Set(s5.strings.join(" ").split(/\s/).filter((t5) => "" !== t5)));
        for (const t5 in i6) i6[t5] && !this.nt?.has(t5) && this.st.add(t5);
        return this.render(i6);
      }
      const r8 = s5.element.classList;
      for (const t5 of this.st) t5 in i6 || (r8.remove(t5), this.st.delete(t5));
      for (const t5 in i6) {
        const s6 = !!i6[t5];
        s6 === this.st.has(t5) || this.nt?.has(t5) || (s6 ? (r8.add(t5), this.st.add(t5)) : (r8.remove(t5), this.st.delete(t5)));
      }
      return E;
    }
  });

  // node_modules/lit-html/directive-helpers.js
  var { I: t4 } = j;
  var r6 = (o8) => void 0 === o8.strings;

  // node_modules/lit-html/async-directive.js
  var s4 = (i6, t5) => {
    const e7 = i6._$AN;
    if (void 0 === e7) return false;
    for (const i7 of e7) i7._$AO?.(t5, false), s4(i7, t5);
    return true;
  };
  var o6 = (i6) => {
    let t5, e7;
    do {
      if (void 0 === (t5 = i6._$AM)) break;
      e7 = t5._$AN, e7.delete(i6), i6 = t5;
    } while (0 === e7?.size);
  };
  var r7 = (i6) => {
    for (let t5; t5 = i6._$AM; i6 = t5) {
      let e7 = t5._$AN;
      if (void 0 === e7) t5._$AN = e7 = /* @__PURE__ */ new Set();
      else if (e7.has(i6)) break;
      e7.add(i6), c4(t5);
    }
  };
  function h3(i6) {
    void 0 !== this._$AN ? (o6(this), this._$AM = i6, r7(this)) : this._$AM = i6;
  }
  function n5(i6, t5 = false, e7 = 0) {
    const r8 = this._$AH, h4 = this._$AN;
    if (void 0 !== h4 && 0 !== h4.size) if (t5) if (Array.isArray(r8)) for (let i7 = e7; i7 < r8.length; i7++) s4(r8[i7], false), o6(r8[i7]);
    else null != r8 && (s4(r8, false), o6(r8));
    else s4(this, i6);
  }
  var c4 = (i6) => {
    i6.type == t3.CHILD && (i6._$AP ??= n5, i6._$AQ ??= h3);
  };
  var f3 = class extends i5 {
    constructor() {
      super(...arguments), this._$AN = void 0;
    }
    _$AT(i6, t5, e7) {
      super._$AT(i6, t5, e7), r7(this), this.isConnected = i6._$AU;
    }
    _$AO(i6, t5 = true) {
      i6 !== this.isConnected && (this.isConnected = i6, i6 ? this.reconnected?.() : this.disconnected?.()), t5 && (s4(this, i6), o6(this));
    }
    setValue(t5) {
      if (r6(this._$Ct)) this._$Ct._$AI(t5, this);
      else {
        const i6 = [...this._$Ct._$AH];
        i6[this._$Ci] = t5, this._$Ct._$AI(i6, this, 0);
      }
    }
    disconnected() {
    }
    reconnected() {
    }
  };

  // node_modules/lit-html/directives/ref.js
  var o7 = /* @__PURE__ */ new WeakMap();
  var n6 = e5(class extends f3 {
    render(i6) {
      return A;
    }
    update(i6, [s5]) {
      const e7 = s5 !== this.G;
      return e7 && this.rt(void 0), (e7 || this.lt !== this.ct) && (this.G = s5, this.ht = i6.options?.host, this.rt(this.ct = i6.element)), A;
    }
    rt(t5) {
      if (void 0 !== this.G) if (this.isConnected || (t5 = void 0), "function" == typeof this.G) {
        const i6 = this.ht ?? globalThis;
        let s5 = o7.get(i6);
        void 0 === s5 && (s5 = /* @__PURE__ */ new WeakMap(), o7.set(i6, s5)), void 0 !== s5.get(this.G) && this.G.call(this.ht, void 0), s5.set(this.G, t5), void 0 !== t5 && this.G.call(this.ht, t5);
      } else this.G.value = t5;
    }
    get lt() {
      return "function" == typeof this.G ? o7.get(this.ht ?? globalThis)?.get(this.G) : this.G?.value;
    }
    disconnected() {
      this.lt === this.ct && this.rt(void 0);
    }
    reconnected() {
      this.rt(this.ct);
    }
  });

  // src/handles.ts
  var findAccessor = (object, key) => {
    for (let proto = Object.getPrototypeOf(object); proto; proto = Object.getPrototypeOf(proto)) {
      const descriptor = Object.getOwnPropertyDescriptor(proto, key);
      if (descriptor) {
        return descriptor;
      }
    }
    return void 0;
  };
  var stopAtOtherHandle = (slider, canPush) => {
    const accessors = {
      minValue: findAccessor(slider, "minValue"),
      maxValue: findAccessor(slider, "maxValue")
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
      { capture: true }
    );
    slider.addEventListener(
      "keydown",
      () => {
        startedTogether = false;
      },
      { capture: true }
    );
    const setThumbValue = slider.setThumbValueFromCoordinates;
    if (typeof setThumbValue === "function") {
      slider.setThumbValueFromCoordinates = function(x2, y3, thumb) {
        return setThumbValue.call(this, x2, y3, this.activeThumb || thumb);
      };
    }
    for (const [key, handle] of [
      ["minValue", "min"],
      ["maxValue", "max"]
    ]) {
      const { get, set } = accessors[key];
      Object.defineProperty(slider, key, {
        configurable: true,
        get() {
          return get.call(this);
        },
        set(value) {
          const moving = this.activeThumb;
          if (canPush() || !moving) {
            set.call(this, value);
            return;
          }
          if (moving !== handle) {
            if (startedTogether && this.minValue === this.maxValue && value !== get.call(this)) {
              startedTogether = false;
              this.activeThumb = handle;
              this.valueWhenDraggingStarted = NaN;
              set.call(this, value);
              this.showRangeTooltips?.();
            }
            return;
          }
          const stopped = handle === "min" ? Math.min(value, this.maxValue) : Math.max(value, this.minValue);
          if (stopped !== get.call(this)) {
            startedTogether = false;
          }
          set.call(this, stopped);
        }
      });
    }
  };

  // src/slider-model.ts
  var NO_VALUE_STATES = [UNAVAILABLE, UNKNOWN];
  var hasValue = (stateObj) => !NO_VALUE_STATES.includes(stateObj.state);
  var computeSliderModel = (config, hass) => {
    const language = languageOf(hass);
    const lower = hass.states[config.entity_low];
    const upper = hass.states[config.entity_high];
    const missing = [config.entity_low, config.entity_high].find((entityId) => !hass.states[entityId]);
    if (missing) {
      return { warning: createEntityNotFoundWarning(hass, missing) };
    }
    const kind = kindOf(lower);
    if (!kind || kindOf(upper) !== kind) {
      return { warning: translate("warning.mixed_kinds", language) };
    }
    const range = kind.range(config, lower, upper, hass);
    if (!Number.isFinite(range.min) || !Number.isFinite(range.max)) {
      return { warning: translate("warning.bad_limit", language) };
    }
    if (!(range.min < range.max)) {
      return { warning: translate("warning.bad_range", language) };
    }
    const values = [kind.value(lower, hass), kind.value(upper, hass)];
    return {
      model: {
        kind,
        range,
        lower,
        upper,
        values,
        disabled: ![lower, upper].every(hasValue) || !values.every(Number.isFinite),
        show: config.show ?? "both",
        // A full width slider leaves no room next to it.
        position: config.full_width ? "below" : isSet(config.position) ? config.position : kind.position
      }
    };
  };
  var formatValues = (model, stateObjs, hass) => {
    if (!stateObjs.length) {
      return "";
    }
    const noValue = stateObjs.find((stateObj) => !hasValue(stateObj));
    return noValue ? hass.formatEntityState(noValue) : model.kind.format(stateObjs, model.range, hass);
  };

  // src/entity-range-slider-row.ts
  var ROW_TAG = "entity-range-slider-row";
  var NARROW_WIDTH = 300;
  var __redraw_dec, __narrow_dec, __ready_dec2, __config_dec2, _full_dec, _hass_dec2, _a2, _init2, _hass2, _full, __config2, __ready2, __narrow, __redraw;
  var EntityRangeSliderRow = class extends (_a2 = i4, _hass_dec2 = [n4({ attribute: false })], _full_dec = [n4({ type: Boolean, reflect: true })], __config_dec2 = [r5()], __ready_dec2 = [r5()], __narrow_dec = [r5()], __redraw_dec = [r5()], _a2) {
    constructor() {
      super(...arguments);
      __privateAdd(this, _hass2, __runInitializers(_init2, 8, this)), __runInitializers(_init2, 11, this);
      __privateAdd(this, _full, __runInitializers(_init2, 12, this, false)), __runInitializers(_init2, 15, this);
      __privateAdd(this, __config2, __runInitializers(_init2, 16, this)), __runInitializers(_init2, 19, this);
      __privateAdd(this, __ready2, __runInitializers(_init2, 20, this, false)), __runInitializers(_init2, 23, this);
      __privateAdd(this, __narrow, __runInitializers(_init2, 24, this, false)), __runInitializers(_init2, 27, this);
      __privateAdd(this, __redraw, __runInitializers(_init2, 28, this, 0)), __runInitializers(_init2, 31, this);
      __publicField(this, "_result");
      __publicField(this, "_drawnHass");
      __publicField(this, "_slider");
      // The last slider that got the handle rules, so it never gets them twice.
      __publicField(this, "_preparedSlider");
      __publicField(this, "_sliderFormatter");
      __publicField(this, "_dragging", false);
      __publicField(this, "_settingValues", false);
      // Counts the saves, so only the newest one puts the handles back.
      __publicField(this, "_saveCount", 0);
      __publicField(this, "_resizeObserver");
      // Runs when the slider is drawn, once more for each new slider, and with
      // no element when the slider goes away.
      __publicField(this, "_sliderRendered", (element) => {
        this._slider = element;
        const slider = this._slider;
        if (!slider || slider === this._preparedSlider) {
          return;
        }
        this._preparedSlider = slider;
        this._sliderFormatter = slider.valueFormatter;
        stopAtOtherHandle(slider, () => this._settingValues || this._config?.push === true);
        slider.addEventListener("pointerdown", this._dragStart, { capture: true });
      });
      // Updates from Home Assistant must not move a handle while it is dragged.
      __publicField(this, "_dragStart", () => {
        this._dragging = true;
        window.addEventListener("pointerup", this._dragEnd, true);
        window.addEventListener("pointercancel", this._dragEnd, true);
      });
      __publicField(this, "_dragEnd", () => {
        this._dragging = false;
        window.removeEventListener("pointerup", this._dragEnd, true);
        window.removeEventListener("pointercancel", this._dragEnd, true);
        this.requestUpdate();
      });
    }
    static getConfigElement() {
      return document.createElement(EDITOR_TAG);
    }
    setConfig(config) {
      validateConfig(config);
      this._config = config;
    }
    connectedCallback() {
      super.connectedCallback();
      loadRowElements().then(
        () => {
          this._ready = true;
        },
        () => {
        }
      );
      this._resizeObserver ??= new ResizeObserver(() => {
        this._narrow = this.clientWidth <= NARROW_WIDTH;
      });
      this._resizeObserver.observe(this);
    }
    disconnectedCallback() {
      super.disconnectedCallback();
      this._resizeObserver?.disconnect();
      if (this._dragging) {
        this._dragEnd();
      }
    }
    shouldUpdate(changed) {
      if (!this._config || !this.hass || !this._ready || this._dragging) {
        return false;
      }
      return ["_config", "_ready", "_narrow", "_redraw"].some((key) => changed.has(key)) || hasHassChanged(this._drawnHass, this.hass, [this._config.entity_low, this._config.entity_high]);
    }
    // shouldUpdate only lets an update through with _config and hass set, and
    // willUpdate sets _result, so the ! below in willUpdate, render and updated
    // are safe.
    willUpdate() {
      if (this.clientWidth) {
        this._narrow = this.clientWidth <= NARROW_WIDTH;
      }
      this.full = this._config.full_width === true && !this._narrow;
      this._drawnHass = this.hass;
      this._result = computeSliderModel(this._config, this.hass);
    }
    render() {
      const config = this._config;
      const hass = this.hass;
      const result = this._result;
      if (!result.model) {
        return b2`<hui-warning .hass=${hass}>${result.warning}</hui-warning>`;
      }
      const model = result.model;
      const { lower, upper, range, show } = model;
      const below = model.position === "below";
      const full = this.full;
      const shown = { both: [lower, upper], low: [lower], high: [upper], none: [] }[show];
      const text = (value) => config.small && value ? b2`<small>${value}</small>` : value;
      const rowConfig = {
        ...config,
        entity: config.entity_low,
        name: isSet(config.name) ? config.name : computePairName(hass, lower, upper)
      };
      return b2`
			<hui-generic-entity-row .hass=${hass} .config=${rowConfig} .catchInteraction=${false}>
				<div class=${e6({ flex: true, full })}>
					<div class="slider">
						<ha-slider
							range
							.min=${range.min}
							.max=${range.max}
							.step=${range.step}
							.disabled=${model.disabled}
							${n6(this._sliderRendered)}
							@change=${this._sliderChanged}
						></ha-slider>
						<div class="below" ?hidden=${!below || show === "none"}>
							<span>${text(below && shown.includes(lower) ? formatValues(model, [lower], hass) : "")}</span>
							<span>${text(below && shown.includes(upper) ? formatValues(model, [upper], hass) : "")}</span>
						</div>
					</div>
					<span class="state" ?hidden=${this._narrow || full}>${text(below ? "" : formatValues(model, shown, hass))}</span>
				</div>
			</hui-generic-entity-row>
		`;
    }
    updated() {
      const slider = this._slider;
      const model = this._result?.model;
      if (!slider || !model) {
        return;
      }
      slider.valueFormatter = model.kind.valueFormatter?.(this.hass) ?? this._sliderFormatter;
      if (!model.disabled) {
        this._settingValues = true;
        [slider.minValue, slider.maxValue] = model.values;
        this._settingValues = false;
      }
    }
    async _sliderChanged() {
      const hass = this.hass;
      const model = this._result?.model;
      const slider = this._slider;
      if (!model || !slider) {
        return;
      }
      const { kind, range, lower, upper } = model;
      const lowerState = hass.states[lower.entity_id];
      const upperState = hass.states[upper.entity_id];
      if (!lowerState || !upperState) {
        return;
      }
      const lowerNow = kind.value(lowerState, hass);
      const upperNow = kind.value(upperState, hass);
      const lowerValue = kind.round(slider.minValue, range);
      const upperValue = kind.round(slider.maxValue, range);
      const writes = [];
      if (lowerValue !== lowerNow) {
        writes.push([lower.entity_id, lowerValue]);
      }
      if (upperValue !== upperNow) {
        writes.push([upper.entity_id, upperValue]);
      }
      if (writes.length === 2 && upperValue > upperNow) {
        writes.reverse();
      }
      const save = ++this._saveCount;
      try {
        for (const [entityId, value] of writes) {
          await kind.save(hass, entityId, value);
        }
      } catch {
        if (save === this._saveCount) {
          this._redraw++;
        }
      }
    }
  };
  _init2 = __decoratorStart(_a2);
  _hass2 = new WeakMap();
  _full = new WeakMap();
  __config2 = new WeakMap();
  __ready2 = new WeakMap();
  __narrow = new WeakMap();
  __redraw = new WeakMap();
  __decorateElement(_init2, 4, "hass", _hass_dec2, EntityRangeSliderRow, _hass2);
  __decorateElement(_init2, 4, "full", _full_dec, EntityRangeSliderRow, _full);
  __decorateElement(_init2, 4, "_config", __config_dec2, EntityRangeSliderRow, __config2);
  __decorateElement(_init2, 4, "_ready", __ready_dec2, EntityRangeSliderRow, __ready2);
  __decorateElement(_init2, 4, "_narrow", __narrow_dec, EntityRangeSliderRow, __narrow);
  __decorateElement(_init2, 4, "_redraw", __redraw_dec, EntityRangeSliderRow, __redraw);
  __decoratorMetadata(_init2, EntityRangeSliderRow);
  // Home Assistant's number row styles (hui-input-number-entity-row), with the
  // few additions a range needs marked as such.
  __publicField(EntityRangeSliderRow, "styles", i`
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
			margin-block-start: var(--ha-space-2);
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
	`);

  // src/entity-range-slider-card.ts
  var CARD_TAG = "entity-range-slider";
  var __config_dec3, _a3, _init3, __config3;
  var EntityRangeSliderCard = class extends (_a3 = i4, __config_dec3 = [r5()], _a3) {
    constructor() {
      super(...arguments);
      __privateAdd(this, __config3, __runInitializers(_init3, 8, this)), __runInitializers(_init3, 11, this);
      __publicField(this, "_row", document.createElement(ROW_TAG));
    }
    static getConfigElement() {
      return document.createElement(EDITOR_TAG);
    }
    static getStubConfig(hass, entities, entitiesFill) {
      return stubConfig(hass, entities, entitiesFill);
    }
    // The row decides itself when to draw again.
    set hass(hass) {
      this._row.hass = hass;
    }
    setConfig(config) {
      validateConfig(config);
      this._config = config;
      this._row.setConfig(config);
    }
    getCardSize() {
      return 1;
    }
    getGridOptions() {
      return { columns: 12, min_columns: 6 };
    }
    render() {
      return b2`
			<ha-card>
				<div class="card-content">${this._row}</div>
			</ha-card>
		`;
    }
  };
  _init3 = __decoratorStart(_a3);
  __config3 = new WeakMap();
  __decorateElement(_init3, 4, "_config", __config_dec3, EntityRangeSliderCard, __config3);
  __decoratorMetadata(_init3, EntityRangeSliderCard);
  __publicField(EntityRangeSliderCard, "styles", i`
		:host {
			display: block;
		}
		ha-card {
			height: 100%;
		}
	`);

  // src/entity-range-slider.ts
  var VERSION = "0.6.0";
  var REPOSITORY = "https://github.com/mm98/ha-entity-range-slider";
  var defineOnce = (tag, element) => {
    if (!customElements.get(tag)) {
      customElements.define(tag, element);
    }
  };
  defineOnce(ROW_TAG, EntityRangeSliderRow);
  defineOnce(EDITOR_TAG, EntityRangeSliderEditor);
  defineOnce(CARD_TAG, EntityRangeSliderCard);
  window.customCards ??= [];
  if (!window.customCards.some((card) => card.type === CARD_TAG)) {
    window.customCards.push({
      type: CARD_TAG,
      // The product name, the same in every language.
      name: "Entity range slider",
      // Read when the card picker opens, so it follows the current language.
      get description() {
        return translate("card.description", languageOf());
      },
      preview: true,
      documentationURL: REPOSITORY,
      getEntitySuggestion: (hass, entityId) => {
        const pair = findEntityPair(hass, entityId);
        return pair ? { config: { type: `custom:${CARD_TAG}`, ...pair } } : null;
      }
    });
  }
  console.info(`entity-range-slider ${VERSION}`);
})();
/*! Bundled license information:

@lit/reactive-element/css-tag.js:
  (**
   * @license
   * Copyright 2019 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/reactive-element.js:
lit-html/lit-html.js:
lit-element/lit-element.js:
@lit/reactive-element/decorators/custom-element.js:
@lit/reactive-element/decorators/property.js:
@lit/reactive-element/decorators/state.js:
@lit/reactive-element/decorators/event-options.js:
@lit/reactive-element/decorators/base.js:
@lit/reactive-element/decorators/query.js:
@lit/reactive-element/decorators/query-all.js:
@lit/reactive-element/decorators/query-async.js:
@lit/reactive-element/decorators/query-assigned-nodes.js:
lit-html/directive.js:
lit-html/async-directive.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

lit-html/is-server.js:
  (**
   * @license
   * Copyright 2022 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/decorators/query-assigned-elements.js:
  (**
   * @license
   * Copyright 2021 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

lit-html/directives/class-map.js:
  (**
   * @license
   * Copyright 2018 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

lit-html/directive-helpers.js:
lit-html/directives/ref.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)
*/
