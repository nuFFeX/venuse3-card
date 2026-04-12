# Changelog

## [Unreleased]

### Fixed
- Mobile-Layout: Batterie-Kachel wurde auf Smartphones in eine erzwungene zweite Spalte geschoben (Inline-`grid-column`-Style überschrieb die Media-Query). Behoben mit `!important`-Override in der `@media (max-width: 700px)`-Regel.

### Removed
- Alle Solar-Optionen entfernt — der Marstek Venus E verfügt über keinen MPPT-Eingang:
  - Entitäten `pv_power` und `total_pv_energy` aus Konfiguration und Editor entfernt
  - Solar-Kachel (`_renderSolar`) und Energie-Kachel (`_renderEnergy`) entfernt
  - Solar-Node aus dem Power-Flow-Strip entfernt
  - Solar-Anzeige aus der Compact-Ansicht entfernt
  - Konfigurationsoptionen `solar`, `energy`, `max_pv_power` entfernt
  - PV-basierte Lade-/Entlade-Heuristik in `_batteryClass()` entfernt (nur noch `charge_permission`/`discharge_permission`)
  - Lokalisierungsstrings für Solar bereinigt (EN + DE)

## [1.1.0] – 2025-04-01

### Added
- Eingebettete i18n (EN/DE) direkt in `venuse3-card.js` — kein separater `localize/`-Ordner nötig
- Leistungsfluss-Leiste (`show_flow`) mit Solar / Netz / Insel / Batterie-Nodes
- Kompaktansicht (`compact`) für platzsparende Dashboards
- Unterstützung für `offgrid_power` (Insel-Betrieb)
- `custom_settings` für beliebige Zusatz-Entitäten
- Editor (`venuse3-card-editor`) mit `ha-form`-Schema

## [1.0.0] – 2025-03-01

### Added
- Initiale Implementierung der Venus E 3.0 Lovelace-Karte
- Batterie-Ring mit SoC-Anzeige und Lade-/Entlade-Animation
- Netz-Kachel, Betriebsmodus-Auswahl
- Teal-Farbwelt passend zum Marstek Venus E
