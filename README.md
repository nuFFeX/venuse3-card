# Venus E 3.0 Card

Lovelace card for **Marstek Venus E 3.0** data from the custom integration [`marstek_venus`](https://github.com/) (project `marstek-venus-e-api`). Layout and behaviour are oriented on the [b2500d-card](https://github.com/) structure: solar bar, grid power, battery ring, total PV energy, optional mode select.

## Installation

1. Copy the folder `venuse3-card` (including `localize/`) into `config/www/community/venuse3-card/` (or your preferred path under `www`).
2. Add a Lovelace resource:

```yaml
resources:
  - url: /local/community/venuse3-card/venuse3-card.js
    type: module
```

3. Reload the frontend (or restart Home Assistant).

### HACS (manual)

Add as custom repository (Lovelace plugin) if you publish the repo, or install by copying files as above. The repository must contain `venuse3-card.js` and `localize/*.js` next to it so that relative imports resolve.

## Configuration

Minimal configuration requires **`entities.battery_soc`**. All other keys are optional; hide blocks with the boolean flags (`solar`, `grid`, `battery`, `energy`, `settings`).

| Key | Description |
|-----|-------------|
| `battery_soc` | State of charge (%) |
| `battery_capacity` | Capacity (Wh), shown as kWh in the ring |
| `pv_power` | Solar power (W) |
| `ongrid_power` | Grid power (W) |
| `offgrid_power` | Off-grid power (W), optional |
| `total_pv_energy` | Total PV energy (Wh or kWh), optional |
| `operating_mode` | Sensor for current mode text (optional) |
| `mode_select` | `select.marstek_venus_operating_mode` for the settings row |
| `charge_permission` | Switch (read-only flags); used for charge animation hint |
| `discharge_permission` | Switch; used for discharge animation hint |

Entity IDs may differ depending on your device name in the registry. Check **Developer tools → States** and adjust the prefix (often `sensor.marstek_venus_*`).

### Example

See `examples/dashboard-snippet.yaml`.

## Build (optional)

To bundle a single file (experimental):

```bash
npm install
npm run build
```

Output: `dist/venuse3-card.js` (you would need to inline or adjust localize imports for a true single-file drop-in).

## License

MIT
