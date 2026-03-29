# Venus E 3.0 Card

Lovelace card for **Marstek Venus E 3.0** with the custom integration `marstek_venus` (marstek-venus-e-api). Layout is oriented on the [B2500D-Card](https://github.com/Neisi/B2500D-Card): **one JavaScript file** without extra `localize/` paths under `/local/`, same idea as the bundled b2500d release.

## Installation (aligned with b2500d manual install)

1. Copy **`venuse3-card.js`** to `/config/www/` (only this file).
2. Register the resource (YAML mode `configuration.yaml` or **Settings → Dashboards → three dots → Resources**):

```yaml
resources:
  - url: /local/venuse3-card.js
    type: module
```

3. **Developer tools → YAML → Restart** is not required for resources; reload the browser or **Ctrl+F5**. If the card still does not appear, clear cache or add `?v=2` to the resource URL once.

4. In the dashboard use:

```yaml
type: custom:venuse3-card
name: Venus E 3.0
entities:
  battery_soc: sensor.marstek_venus_battery_soc
  # … see examples/dashboard-snippet.yaml
```

### Previous mistake (why the card stayed blank)

If the resource pointed to `venuse3-card.js` **but** the `localize/` folder was missing or not next to that file, the browser failed to load `./localize/en.js` (404). Relative imports resolve next to the script URL, e.g. `/local/localize/en.js` when the script lies in `/local/` — wrong. **Now all strings are inside `venuse3-card.js`.**

### HACS

`hacs.json` uses `content_in_root: true` and `filename: venuse3-card.js` like b2500d. After install, the resource is often added automatically; if not, set it manually to `/hacsfiles/venuse3-card/venuse3-card.js` (exact path depends on your HACS version; check **HACS → the plugin → Open source**).

## Configuration

Minimal: **`entities.battery_soc`**. Full entity list: see `examples/dashboard-snippet.yaml` and the visual editor.

Entity IDs may differ (e.g. `sensor.marstek_venus_*`); check **Developer tools → States**.

## Optional: `localize/` folder

The files under `localize/` are **reference copies** of the English/German strings; the running card uses the embedded `languages` object in `venuse3-card.js`. Edit that object (or sync from `localize/*.js` after edits there).

## Optional build

```bash
npm install && npm run build
```

Rollup outputs `dist/venuse3-card.js` (no separate localize imports in the current source).

## License

MIT
