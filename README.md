# Venus E 3.0 Card

Lovelace-Karte für den **Marstek Venus E** (Hybrid: Wechselrichter + Speicher) mit der Integration **marstek_venus**. Die Darstellung ist bewusst **nicht** wie beim Marstek B2500 (separate MPPT-Strings), sondern näher an **All-in-One-Hybrid-Übersichten**: Leistungsfluss Solar / Netz / optional Insel / Batterie, Teal-Farbwelt und Fokus auf System- statt Zellenoptik.

## UI-Konzept (Recherche / Einordnung)

Hersteller- und Fachmaterial zum Venus E betont **App-Steuerung**, **Betriebsmodi** (z. B. Eigenverbrauch, KI/Preisbezug, manuell) und **Hybrid-Funktion** statt klassischer „Akku mit zwei PV-Strings“. Gängige Speicher-Dashboards (App & Portal) nutzen deshalb oft eine **Fluss- oder Statuszeile** (PV, Netz, Haus/Speicher) plus Detailkacheln. Diese Karte spiegelt das mit der **Flow-Leiste** und den bestehenden Detailkarten wider.

## Installation

Eine Datei **`venuse3-card.js`** nach `/config/www/` kopieren und als Modul einbinden:

```yaml
resources:
  - url: /local/venuse3-card.js
    type: module
```

Details siehe frühere Version der Anleitung (kein `localize/`-Ordner nötig).

## Entitäten: Deutsch vs. Englisch

In der YAML-Konfiguration bleiben die **Schlüssel** immer gleich (`battery_soc`, `pv_power`, …). Nur die **Home-Assistant-`entity_id`** hängt von der **UI-Sprache** und der Slug-Bildung ab.

| Konfig-Schlüssel | Integration (de.json) | Beispiel DE | Beispiel EN |
|------------------|------------------------|------------|-------------|
| `battery_soc` | Batterie-Ladezustand | `sensor.marstek_venus_batterie_ladezustand` | `sensor.marstek_venus_battery_soc` |
| `battery_capacity` | Batteriekapazität | `sensor.marstek_venus_batteriekapazitat` | `sensor.marstek_venus_battery_capacity` |
| `pv_power` | Solarleistung | `sensor.marstek_venus_solarleistung` | `sensor.marstek_venus_pv_power` |
| `ongrid_power` | Netzleistung | `sensor.marstek_venus_netzleistung` | `sensor.marstek_venus_ongrid_power` |
| `offgrid_power` | Off-Grid-Leistung | `sensor.marstek_venus_off_grid_leistung` | `sensor.marstek_venus_offgrid_power` |
| `total_pv_energy` | Gesamte Solarenergie | `sensor.marstek_venus_gesamte_solarenergie` | `sensor.marstek_venus_total_pv_energy` |
| `operating_mode` | Betriebsmodus | `sensor.marstek_venus_betriebsmodus` | `sensor.marstek_venus_operating_mode` |
| `mode_select` | Betriebsmodus | `select.marstek_venus_betriebsmodus` | `select.marstek_venus_operating_mode` |
| `charge_permission` | Ladeberechtigung | `switch.marstek_venus_ladeberechtigung` | `switch.marstek_venus_charge_permission` |
| `discharge_permission` | Entladeberechtigung | `switch.marstek_venus_entladeberechtigung` | `switch.marstek_venus_discharge_permission` |

Abweichende Slugs (z. B. Umlaute) bitte unter **Einstellungen → Geräte & Dienste → Entitäten** oder **Entwicklerwerkzeuge → Zustände** prüfen und die YAML anpassen.

## Beispiele

- `examples/dashboard-snippet-de.yaml` – deutsche `entity_id`-Beispiele  
- `examples/dashboard-snippet.yaml` – englische Beispiele  

## Parameter (Auszug)

- **`subtitle`**: Zeile unter dem Titel (Standard: `Venus E 3.0`). Leer lassen und im Code greift eine kurze Produktzeile (Hybrid-Bezug).
- **`show_flow`**: Leistungsfluss-Leiste ein/aus (Standard: an).
- **`icon`**: klassisches vertikales Balken-Icon (eher „Hardware“-Look; Standard: aus, damit Venus E nicht wie B2500 wirkt).
- Weitere Schalter wie `solar`, `grid`, `battery`, `energy`, `settings`, `max_pv_power` unverändert.

## `localize/`

Nur Referenz; die laufende Karte nutzt eingebettete Texte in `venuse3-card.js`.

## Lizenz

MIT
