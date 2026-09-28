# Entity Range Slider for Home Assistant

A dashboard card with one slider and two handles. The left handle sets one entity, the right handle sets another, so together they set a range: the temperature band a room should stay in, the hours the heating runs, the dates of a vacation or the window for charging the car.

It works with numbers, times, dates and dates with times. It looks and works like Home Assistant's own number slider and follows your theme. The lower value can never go above the upper value.

<img src="https://raw.githubusercontent.com/mm98/ha-entity-range-slider/main/images/values-below.png" alt="A range slider for the heating, with 19.0 °C and 22.5 °C below the slider" width="50%">

The card editor is available in English and Danish.

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

Two entities that hold the same kind of value: one for the lower value and one for the upper value.

- Numbers: Number helpers (`input_number`) or `number` entities.
- Times, dates or dates with times: Date and/or time helpers (`input_datetime`), or `time`, `date` and `datetime` entities.

The easiest is two helpers. Go to **Settings > Devices & services > Helpers**, select **Create helper** and pick **Number** or **Date and/or time**. Make one for the lower value and one for the upper value, for example "Heating low" and "Heating high", with the same settings.

## Add the card

Edit a dashboard, select **Add card** and pick **Entity range slider**. Choose the two entities and you are done.

When you pick one entity of a pair in the card picker, for example `input_number.heating_low`, and its partner exists (`input_number.heating_high`), the card is suggested with both filled in.

## Examples

### Values right of the slider

The default for numbers, like Home Assistant's number slider. The values get the same space as the value of a number slider, so a longer text is cut off with "...". Use `position: below` for longer values.

<img src="https://raw.githubusercontent.com/mm98/ha-entity-range-slider/main/images/values-right.png" alt="Fan speed from 30 to 70, with the values right of the slider" width="50%">

```yaml
type: custom:entity-range-slider
entity_min: input_number.fan_speed_low
entity_max: input_number.fan_speed_high
name: Fan speed
```

### Values below the slider

The lower value under the left end of the slider, the upper value under the right end, in full.

<img src="https://raw.githubusercontent.com/mm98/ha-entity-range-slider/main/images/values-below.png" alt="Heating from 19.0 °C to 22.5 °C, with the values below the slider" width="50%">

```yaml
type: custom:entity-range-slider
entity_min: input_number.heating_low
entity_max: input_number.heating_high
name: Heating
position: below
```

### Small values

`small: true` shows the values in small text, below the slider or right of it.

<img src="https://raw.githubusercontent.com/mm98/ha-entity-range-slider/main/images/values-small.png" alt="Heating from 19.0 °C to 22.5 °C, with small values below the slider" width="50%">

```yaml
type: custom:entity-range-slider
entity_min: input_number.heating_low
entity_max: input_number.heating_high
name: Heating
position: below
small: true
```

### In an entities card

As a row among other rows. Its icon, name and slider line up with Home Assistant's number rows around it.

<img src="https://raw.githubusercontent.com/mm98/ha-entity-range-slider/main/images/entities-card.png" alt="An entities card with a number slider for the fan speed and a range slider from 30 to 70 below it" width="50%">

```yaml
type: entities
entities:
  - input_number.fan_speed
  - type: custom:entity-range-slider-row
    entity_min: input_number.fan_speed_low
    entity_max: input_number.fan_speed_high
    name: Fan speed range
```

### Times

The slider runs from 00:00 to 23:59 in steps of 15 minutes, unless you set `min`, `max` and `step`. Times are shown below the slider by default.

<img src="https://raw.githubusercontent.com/mm98/ha-entity-range-slider/main/images/times.png" alt="Heating hours from 6:30 AM to 10:00 PM" width="50%">

```yaml
type: custom:entity-range-slider
entity_min: input_datetime.heating_on
entity_max: input_datetime.heating_off
name: Heating hours
```

### Dates

The slider runs from today to 30 days from today in steps of one day, unless you set `min`, `max` and `step`.

<img src="https://raw.githubusercontent.com/mm98/ha-entity-range-slider/main/images/dates.png" alt="A vacation from Oct 5 to Oct 12" width="50%">

```yaml
type: custom:entity-range-slider
entity_min: input_datetime.vacation_start
entity_max: input_datetime.vacation_end
name: Vacation
max: "+60d"
```

### Dates with times

The slider runs from today to 30 days from today in steps of one hour, unless you set `min`, `max` and `step`.

<img src="https://raw.githubusercontent.com/mm98/ha-entity-range-slider/main/images/date-times.png" alt="Car charging from Sep 29, 10:00 PM to Sep 30, 6:00 AM" width="50%">

```yaml
type: custom:entity-range-slider
entity_min: input_datetime.charging_start
entity_max: input_datetime.charging_end
name: Car charging
max: "+3d"
step: 30
small: true
```

## Settings

| Setting | What it does |
|---|---|
| `entity_min` | The entity the left handle sets. Required. |
| `entity_max` | The entity the right handle sets. Required. |
| `name` | Name shown next to the icon. By default the words both entity names share, for example "Heating" for "Heating low" and "Heating high". |
| `icon` | Icon at the start of the row. By default the icon of `entity_min`. |
| `min` | Lowest value on the slider. See **Limits and steps** below. |
| `max` | Highest value on the slider. See **Limits and steps** below. |
| `step` | How much a value changes per step. See **Limits and steps** below. |
| `unit` | For numbers: the unit shown after the values. By default the unit of the entities. |
| `show` | Which values to show: `both` (default), `lower`, `upper` or `none`. |
| `position` | Where to show the values: `right` or `below`. By default `right` for numbers and `below` for times and dates, which are too long for the space on the right. On very narrow cards the values on the right are left out, like on the number slider. |
| `small` | `true` shows the values in small text. `false` by default. |
| `push` | `true` lets a handle push the other one along. `false` by default. See **Handles** below. |

## Limits and steps

| Kind | `min` and `max` | `step` |
|---|---|---|
| Numbers | Numbers. By default the minimum of `entity_min` and the maximum of `entity_max`. | By default the step of `entity_min`. |
| Times | Times like `06:00`. By default `00:00` and `23:59`. | Minutes, 15 by default. |
| Dates | Dates like `2026-10-01`, or relative to today: `today`, `+7d`, `-7d`. By default `today` and `+30d`. | Days, 1 by default. |
| Dates with times | Like dates, also with a time: `2026-10-01 18:00`. By default `today` and `+30d`. | Minutes, 60 by default. |

Times and dates are shown the way Home Assistant shows them, following the language, the 12 or 24 hour clock and the time zone of your user profile. A time range stays within one day: the lower time is always before the upper time.

## Handles

By default a handle stops when it reaches the other handle, so the lower value stays at or below the upper value. With `push: true`, a handle pushes the other one along instead, and both entities change.

When both handles sit on the same spot, drag in the direction you want: left moves the lower value, right moves the upper value. With the keyboard, select a handle with Tab and move it with the arrow keys.

## Good to know

The card keeps the lower value at or below the upper value for changes made with the card. Changes made elsewhere, for example in an automation or in the entity's own dialog, are not checked by the card.
