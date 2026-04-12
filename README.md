# Venus E 3.0 Card

Lovelace-Karte für den **Marstek Venus E** (Hybrid: Wechselrichter + Speicher) mit der Integration **marstek_venus**. Die Darstellung fokussiert sich auf **Netz / optional Insel / Batterie** — der Venus E verfügt über **keinen MPPT-Eingang**, Solar-Optionen sind daher nicht vorhanden.

## Installation

Eine Datei **`venuse3-card.js`** nach `/config/www/` kopieren und als Modul einbinden:

```yaml
resources:
  - url: /local/venuse3-card.js
    type: module
```

## Entitäten

In der YAML-Konfiguration bleiben die **Schlüssel** immer gleich. Nur die **Home-Assistant-`entity_id`** hängt von der **UI-Sprache** und der Slug-Bildung ab.

| Konfig-Schlüssel | Integration (de.json) | Beispiel DE | Beispiel EN |
|------------------|------------------------|------------|-------------|
| `battery_soc` | Batterie-Ladezustand | `sensor.marstek_venus_batterie_ladezustand` | `sensor.marstek_venus_battery_soc` |
| `battery_capacity` | Batteriekapazität | `sensor.marstek_venus_batteriekapazitat` | `sensor.marstek_venus_battery_capacity` |
| `ongrid_power` | Netzleistung | `sensor.marstek_venus_netzleistung` | `sensor.marstek_venus_ongrid_power` |
| `offgrid_power` | Off-Grid-Leistung | `sensor.marstek_venus_off_grid_leistung` | `sensor.marstek_venus_offgrid_power` |
| `operating_mode` | Betriebsmodus | `sensor.marstek_venus_betriebsmodus` | `sensor.marstek_venus_operating_mode` |
| `mode_select` | Betriebsmodus | `select.marstek_venus_betriebsmodus` | `select.marstek_venus_operating_mode` |
| `charge_permission` | Ladeberechtigung | `switch.marstek_venus_ladeberechtigung` | `switch.marstek_venus_charge_permission` |
| `discharge_permission` | Entladeberechtigung | `switch.marstek_venus_entladeberechtigung` | `switch.marstek_venus_discharge_permission` |

Abweichende Slugs (z. B. Umlaute) bitte unter **Einstellungen → Geräte & Dienste → Entitäten** oder **Entwicklerwerkzeuge → Zustände** prüfen und die YAML anpassen.

## Konfigurationsparameter

| Parameter | Typ | Standard | Beschreibung |
|-----------|-----|----------|-------------|
| `name` | string | `Marstek Venus` | Kartentitel |
| `subtitle` | string | `Venus E 3.0` | Zeile unter dem Titel; leer lassen für Produktzeile |
| `show_flow` | boolean | `true` | Leistungsfluss-Leiste (Netz / Batterie) ein/aus |
| `grid` | boolean | `true` | Netz-Kachel anzeigen |
| `battery` | boolean | `true` | Batterie-Kachel anzeigen |
| `settings` | boolean | `true` | Einstellungen (Moduswahl) anzeigen |
| `icon` | boolean | `false` | Vertikales Hardware-Icon anzeigen |
| `compact` | boolean | `false` | Kompaktansicht (einzeilig) |
| `custom_settings` | list | — | Zusätzliche Entitäten-Zeilen unten |

## Beispiele

- `examples/dashboard-snippet-de.yaml` – deutsche `entity_id`-Beispiele
- `examples/dashboard-snippet.yaml` – englische Beispiele

## `localize/`

Nur Referenz; die laufende Karte nutzt eingebettete Texte in `venuse3-card.js`.

## Lizenz

MIT
