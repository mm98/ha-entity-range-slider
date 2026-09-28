# Entity Range Slider for Home Assistant

A dashboard card with one slider and two handles. The left handle sets one number entity, the right handle sets another, so together they set a range: for example the temperature band a room should stay in, or the price window for charging the car.

It looks and works like Home Assistant's own number slider and follows your theme. The lower value can never go above the upper value.

Available in English and Danish.

## Install

Requires Home Assistant 2026.9 or newer.

### With HACS

Select this button to open the card in HACS, then select **Download**:

[![Open this repository in HACS](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=mm98&repository=ha-entity-range-slider&category=plugin)

Or add it yourself:

1. Open **HACS**, select the three dots at the top right and pick **Custom repositories**.
2. Enter `https://github.com/mm98/ha-entity-range-slider`, choose the type **Dashboard** and select **Add**.
3. Search HACS for **Entity Range Slider**, open it and select **Download**.
4. Reload the page in your browser.

### Without HACS

1. Copy `dist/entity-range-slider.js` from this repository into the `www` folder of your Home Assistant configuration.
2. Go to **Settings > Dashboards**, select the three dots at the top right and pick **Resources**.
3. Select **Add resource**, enter `/local/entity-range-slider.js`, choose **JavaScript module** and select **Create**.
4. Reload the page in your browser.

## What you need

Two number entities: one for the lower value and one for the upper value. The easiest is two Number helpers:

1. Go to **Settings > Devices & services > Helpers**, select **Create helper** and pick **Number**.
2. Make one for the lower value and one for the upper value, for example "Heating low" and "Heating high", with the same minimum, maximum, step and unit.

Number entities from devices work too.

## Add the card

Edit a dashboard, select **Add card** and pick **Entity range slider**. Choose the two entities and you are done.

When you pick one entity of a pair in the card picker, for example `input_number.heating_low`, and its partner exists (`input_number.heating_high`), the card is suggested with both filled in.

## Settings

| Setting | What it does |
|---|---|
| `entity_min` | The entity the left handle sets. Required. |
| `entity_max` | The entity the right handle sets. Required. |
| `name` | Name shown next to the icon. By default the words both entity names share, for example "Heating" for "Heating low" and "Heating high". |
| `icon` | Icon at the start of the row. By default the icon of `entity_min`. |
| `min` | Lowest value on the slider. By default the minimum of `entity_min`. |
| `max` | Highest value on the slider. By default the maximum of `entity_max`. |
| `step` | How much a value changes per step. By default the step of `entity_min`. |
| `unit` | Unit shown after the values. By default the unit of the entities. |
| `show_value` | Which values to show: `both` (default), `lower`, `upper` or `none`. |
| `value_position` | Where to show them. `right` (default): right of the slider, like Home Assistant's number slider, for example "18,0 - 22,0 °C". It gets the same space as the value of a number slider, so a longer text is cut off with "...". On very narrow cards it is left out. `below`: the lower value under the left end of the slider and the upper value under the right end, in full. |
| `small_values` | `true`: shows the values in small text, right of the slider or below it. `false` by default. |
| `push_handles` | `false` (default): a handle stops when it reaches the other handle. `true`: a handle pushes the other one along, and both entities change. |

Example:

```yaml
type: custom:entity-range-slider
entity_min: input_number.heating_low
entity_max: input_number.heating_high
name: Heating
step: 0.5
unit: °C
value_position: below
```

## In an entities card

To show the range slider as a row among other rows in an entities card, use the row type. It takes the same settings, and its icon, name and slider line up with the number rows around it:

```yaml
type: entities
entities:
  - input_number.fan_speed
  - type: custom:entity-range-slider-row
    entity_min: input_number.heating_low
    entity_max: input_number.heating_high
    name: Heating
```

## Good to know

The card keeps the lower value at or below the upper value for changes made with the card. Changes made elsewhere, for example in an automation or in the entity's own dialog, are not checked by the card.
