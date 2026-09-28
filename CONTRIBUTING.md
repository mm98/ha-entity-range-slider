# Contributing

The card is written in TypeScript with [Lit](https://lit.dev/) and follows the conventions of the [Home Assistant frontend](https://github.com/home-assistant/frontend). One build step turns the source in `src/` into the file Home Assistant loads, `dist/entity-range-slider.js`.

## Build

You need [Node.js](https://nodejs.org/) 20 or newer.

```bash
npm install
npm run check
npm run build
```

- `npm run check` runs the TypeScript type check.
- `npm run build` writes `dist/entity-range-slider.js`. Commit it together with your change in `src/`: HACS installs that file, and a check on GitHub fails when it does not match the source.
- `npm run watch` builds again on every change.

To try a change, copy `dist/entity-range-slider.js` into the `www` folder of a Home Assistant test setup, add it as a dashboard resource and reload the browser.

## Where things are

| Path | What it holds |
|---|---|
| `src/entity-range-slider.ts` | The entry: defines the elements and adds the card to the card picker. |
| `src/entity-range-slider-card.ts`, `-row.ts`, `-editor.ts` | The card, the row for entities cards and the visual editor, one file per element. |
| `src/config.ts`, `src/validators.ts` | The settings and their checks. |
| `src/slider-model.ts` | What the row shows, worked out from the settings and the entity states. |
| `src/handles.ts` | Stops a handle at the other handle unless `push` is on. |
| `src/entity-pair.ts` | Finds entity pairs like `_low` and `_high` for card suggestions. |
| `src/home-assistant.ts` | Home Assistant types, and helpers copied from its frontend under their own names. |
| `src/kinds/` | One object per kind of value (numbers, times, dates, dates with times): how a value is read, shown and saved. |
| `src/i18n/` | The texts of the card, one JSON file per language. |

## Add a language

1. Copy `src/i18n/en.json` to a file named after the language code, for example `src/i18n/fr.json`, and translate the texts. Use the words Home Assistant uses in that language.
2. Import it in `src/i18n/index.ts` and add it to `TRANSLATIONS`.
3. Run `npm run check`. It fails when a text is missing.

Labels of fields Home Assistant already knows, like name, icon and unit, come from Home Assistant's own translations.

## Support another kind of value

Add an object that fulfills `ValueKind` from `src/kinds/value-kind.ts` and list it in `KINDS` in `src/kinds/index.ts`. `src/kinds/number.ts` is the simplest example.
