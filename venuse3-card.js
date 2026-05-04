import { LitElement, html, css } from "https://unpkg.com/lit-element/lit-element.js?module";

/** Inline i18n: eine Datei wie b2500d-Release, damit /local/venuse3-card.js ohne Unterordner funktioniert. */
const languages = {
  en: {
    errors: {
      missing_entities:
        "Provide an entities object with at least battery_soc.",
    },
    labels: {
      last_update: "Last update",
      mode: "Operating mode",
      charge_hint: "Charge",
      discharge_hint: "Discharge",
      product_line: "Marstek Venus E · hybrid inverter & storage",
      flow_caption: "Power flow (live)",
    },
    card: {
      grid: "Grid",
      offgrid: "Off-grid",
      battery: "Battery",
      ct: "CT",
      ct_connected: "CT connected",
      ct_disconnected: "CT disconnected",
      total: "Total",
      realtime: "Realtime power",
      settings: "Settings",
    },
    editor: {
      name: "Card title",
      entities: "Entities",
      compact: "Compact layout",
      icon: "Show device icon",
      grid: "Show grid",
      battery: "Show battery",
      ct: "Show CT meter",
      settings: "Show settings (mode select)",
      custom_settings: "Custom rows (entity / name / icon)",
      subtitle: "Subtitle under title (e.g. Venus E 3.0)",
      show_flow: "Show power-flow strip (Grid / Battery)",
    },
    helpers: {
      entities:
        "Map integration entities (see README for marstek_venus keys).",
      custom_settings:
        "Extra sensor / switch / select rows at the bottom.",
      subtitle: "Short line under the card title; leave empty to hide.",
      show_flow:
        "Quick overview of grid and battery power flow.",
    },
  },
  de: {
    errors: {
      missing_entities:
        "Bitte ein entities-Objekt mit mindestens battery_soc angeben.",
    },
    labels: {
      last_update: "Aktualisierung",
      mode: "Betriebsmodus",
      charge_hint: "Laden",
      discharge_hint: "Entladen",
      product_line: "Marstek Venus E · Hybrid-Wechselrichter & Speicher",
      flow_caption: "Leistungsfluss (live)",
    },
    card: {
      grid: "Netz",
      offgrid: "Insel",
      battery: "Batterie",
      ct: "CT",
      ct_connected: "CT verbunden",
      ct_disconnected: "CT getrennt",
      total: "Gesamt",
      realtime: "Echtzeitleistung",
      settings: "Einstellungen",
    },
    editor: {
      name: "Kartentitel",
      entities: "Entitäten",
      compact: "Kompaktansicht",
      icon: "Geräte-Icon anzeigen",
      grid: "Netz anzeigen",
      battery: "Batterie anzeigen",
      ct: "CT-Zähler anzeigen",
      settings: "Einstellungen (Moduswahl)",
      custom_settings: "Zusätzliche Zeilen (Entität / Name / Icon)",
      subtitle: "Untertitel unter dem Kartentitel (z. B. Venus E 3.0)",
      show_flow: "Leistungsfluss-Leiste (Netz / Batterie)",
    },
    helpers: {
      entities: "Zuordnung der marstek_venus-Entitäten (siehe README).",
      custom_settings:
        "Zusätzliche Sensor-, Schalter- oder Auswahl-Zeilen unten.",
      subtitle: "Kurze Zeile unter dem Titel; leer lassen zum Ausblenden.",
      show_flow:
        "Schnellüberblick über Netz- und Batterie-Leistungsfluss.",
    },
  },
};

function _getLangCode(langInput) {
  const raw = (langInput || (typeof navigator !== "undefined" && navigator.language) || "en")
    .toString()
    .toLowerCase();
  return raw.split(/[_-]/)[0];
}

function localize(key, langInput) {
  const lang = _getLangCode(langInput);
  let result = languages[lang] || languages.en;
  const parts = key.split(".");
  for (const p of parts) {
    result = result?.[p];
    if (!result) break;
  }
  return result || "";
}

function numState(hass, entityId) {
  if (!entityId || !hass?.states[entityId]) return 0;
  const v = Number(hass.states[entityId].state);
  return Number.isFinite(v) ? v : 0;
}

class Venuse3Card extends LitElement {
  static get styles() {
    return css`
      :host {
        --text: var(--primary-text-color);
        --muted: var(--secondary-text-color, var(--primary-text-color));
        --divider: var(--entities-divider-color, var(--divider-color));
        --radius: 22px;
        --venus-teal: #0f766e;
        --venus-cyan: #14b8a6;
        --venus-cyan-bright: #2dd4bf;
        --venus-surface: rgba(20, 184, 166, 0.08);
        display: block;
      }
      .container {
        width: 100%;
        max-width: 600px;
        margin: 0 auto;
        padding: 18px 14px 26px;
        background: var(--ha-card-background, var(--card-background-color, #fff));
        box-shadow: var(--ha-card-box-shadow, none);
        box-sizing: border-box;
        border-radius: var(--ha-card-border-radius, 12px);
        border-width: var(--ha-card-border-width, 1px);
        border-style: solid;
        border-color: var(--ha-card-border-color, var(--divider-color, #e0e0e0));
        color: var(--primary-text-color);
      }
      .device {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 14px;
        padding: 6px 0 14px;
      }
      .status-row {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        margin-top: 8px;
      }
      .status-pill {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 3px 9px 3px 7px;
        font-size: 11px;
        font-weight: 600;
        border-radius: 999px;
        line-height: 1;
        cursor: pointer;
        user-select: none;
      }
      .status-pill .dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        flex-shrink: 0;
      }
      .status-pill.ok {
        background: rgba(16, 185, 129, 0.12);
        color: #10b981;
      }
      .status-pill.ok .dot {
        background: #10b981;
        box-shadow: 0 0 6px rgba(16, 185, 129, 0.7);
      }
      .status-pill.bad {
        background: rgba(239, 68, 68, 0.12);
        color: #ef4444;
      }
      .status-pill.bad .dot {
        background: #ef4444;
        box-shadow: 0 0 6px rgba(239, 68, 68, 0.85);
        animation: dotBlink 1.4s infinite ease-in-out;
      }
      .status-pill.unknown {
        background: rgba(148, 163, 184, 0.14);
        color: var(--muted);
      }
      .status-pill.unknown .dot {
        background: var(--muted);
      }
      @keyframes dotBlink {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.35; }
      }
      .product-line {
        font-size: 11px;
        letter-spacing: 0.04em;
        color: var(--muted);
        margin-top: 4px;
        line-height: 1.35;
        max-width: 100%;
      }
      .flow-wrap {
        width: 100%;
        margin: 4px 0 12px;
        padding: 0 6px;
        box-sizing: border-box;
      }
      .flow-caption {
        font-size: 11px;
        color: var(--muted);
        margin: 0 6px 8px;
        font-weight: 500;
      }
      .flow-row {
        display: flex;
        flex-wrap: wrap;
        align-items: stretch;
        justify-content: center;
        gap: 2px 0;
        padding: 12px 8px;
        background: var(--venus-surface);
        border-radius: 16px;
        border: 1px solid rgba(15, 118, 110, 0.2);
        box-sizing: border-box;
      }
      .flow-node {
        flex: 1 1 76px;
        min-width: 76px;
        max-width: 160px;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        gap: 2px;
        padding: 8px 4px;
        border-radius: 12px;
        cursor: pointer;
        transition: background 0.18s ease;
        box-sizing: border-box;
      }
      .flow-node:hover {
        background: rgba(15, 118, 110, 0.1);
      }
      .flow-node ha-icon {
        color: var(--venus-teal);
        --mdc-icon-size: 28px;
      }
      .flow-node--warn ha-icon {
        color: #f59e0b;
      }
      .flow-node--warn .flow-label {
        color: #f59e0b;
      }
      .flow-label {
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--muted);
        font-weight: 600;
      }
      .flow-value {
        font-size: 17px;
        font-weight: 600;
        color: var(--text);
        line-height: 1.25;
      }
      .flow-unit {
        font-size: 10px;
        font-weight: 500;
        color: var(--muted);
      }
      .flow-chev {
        display: flex;
        align-items: center;
        align-self: center;
        opacity: 0.4;
        padding: 0 2px;
      }
      .flow-chev ha-icon {
        color: var(--muted);
        --mdc-icon-size: 22px;
      }
      /* Marstek Venus E case visualization */
      .unit {
        width: 96px;
        height: 132px;
        border-radius: 12px;
        background: linear-gradient(155deg, #1d1d1f 0%, #0e0e10 55%, #050507 100%);
        box-shadow:
          inset 0 1px 0 rgba(255, 255, 255, 0.08),
          inset 0 -10px 22px rgba(0, 0, 0, 0.55),
          0 6px 18px rgba(0, 0, 0, 0.45);
        position: relative;
        overflow: hidden;
        flex-shrink: 0;
      }
      .unit::before {
        /* glossy diagonal glass highlight */
        content: "";
        position: absolute;
        inset: 0;
        background: linear-gradient(
          135deg,
          rgba(255, 255, 255, 0.18) 0%,
          rgba(255, 255, 255, 0.06) 28%,
          transparent 55%
        );
        pointer-events: none;
      }
      .unit::after {
        /* faint hairline separating the top glass strip from the body */
        content: "";
        position: absolute;
        left: 0;
        right: 0;
        top: 32px;
        height: 1px;
        background: linear-gradient(
          90deg,
          transparent,
          rgba(255, 255, 255, 0.09) 18%,
          rgba(255, 255, 255, 0.09) 82%,
          transparent
        );
        pointer-events: none;
      }
      .unit .led-strip {
        position: absolute;
        top: 14px;
        left: 12px;
        right: 12px;
        height: 4px;
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .unit .led-dots {
        flex: 0 0 22px;
        height: 2px;
        border-radius: 1px;
        background:
          linear-gradient(
            90deg,
            rgba(45, 212, 191, 0.55) 0 5px,
            transparent 5px 8px,
            rgba(45, 212, 191, 0.55) 8px 13px,
            transparent 13px 16px,
            rgba(45, 212, 191, 0.55) 16px 21px,
            transparent 21px 22px
          );
        opacity: 0.85;
      }
      .unit .led-track {
        flex: 1 1 auto;
        height: 2px;
        background: rgba(255, 255, 255, 0.06);
        border-radius: 1px;
        position: relative;
        overflow: hidden;
      }
      .unit .led-fill {
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        width: 0%;
        border-radius: 1px;
        background: var(--venus-cyan);
        box-shadow: 0 0 4px rgba(45, 212, 191, 0.7);
        transition: width 0.6s ease, background 0.4s ease, box-shadow 0.4s ease;
      }
      /* low SOC tint */
      .unit.soc-low .led-fill {
        background: #ef4444;
        box-shadow: 0 0 5px rgba(239, 68, 68, 0.7);
      }
      .unit.soc-mid .led-fill {
        background: #f59e0b;
        box-shadow: 0 0 4px rgba(245, 158, 11, 0.65);
      }
      .unit.soc-full .led-fill {
        background: #67e8f9;
        box-shadow: 0 0 7px rgba(103, 232, 249, 0.85);
      }
      /* moving highlight overlaid on the filled portion to show flow direction */
      .unit .led-fill::after {
        content: "";
        position: absolute;
        top: 0;
        left: -40%;
        width: 40%;
        height: 100%;
        background: linear-gradient(
          90deg,
          transparent 0%,
          rgba(255, 255, 255, 0.85) 50%,
          transparent 100%
        );
        opacity: 0;
      }
      .unit.charging .led-fill::after {
        opacity: 1;
        animation: ledSlide 1.8s infinite linear;
      }
      .unit.discharging .led-fill::after {
        opacity: 1;
        animation: ledSlide 1.8s infinite linear reverse;
      }
      .unit.soc-full.charging .led-fill {
        animation: fullPulse 2s infinite ease-in-out;
      }
      @keyframes ledSlide {
        0% { left: -40%; }
        100% { left: 100%; }
      }
      @keyframes fullPulse {
        0%, 100% { box-shadow: 0 0 7px rgba(103, 232, 249, 0.85); }
        50% { box-shadow: 0 0 12px rgba(103, 232, 249, 1); }
      }
      .unit .case-glow {
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        height: 0%;
        background: linear-gradient(
          0deg,
          rgba(45, 212, 191, 0.32) 0%,
          rgba(45, 212, 191, 0.08) 55%,
          rgba(45, 212, 191, 0) 100%
        );
        pointer-events: none;
        transition: height 0.6s ease, background 0.4s ease;
      }
      .unit.charging .case-glow {
        animation: glowPulseTeal 2.5s infinite ease-in-out;
      }
      .unit.discharging .case-glow {
        background: linear-gradient(
          0deg,
          rgba(251, 146, 60, 0.32) 0%,
          rgba(251, 146, 60, 0.08) 55%,
          rgba(251, 146, 60, 0) 100%
        );
        animation: glowPulseAmber 2.5s infinite ease-in-out;
      }
      @keyframes glowPulseTeal {
        0%, 100% { opacity: 0.7; }
        50% { opacity: 1; }
      }
      @keyframes glowPulseAmber {
        0%, 100% { opacity: 0.7; }
        50% { opacity: 1; }
      }
      .unit .brand {
        position: absolute;
        left: 0;
        right: 0;
        bottom: 14px;
        text-align: center;
        font-size: 8px;
        letter-spacing: 2.4px;
        font-weight: 700;
        color: rgba(255, 255, 255, 0.82);
        text-shadow: 0 1px 0 rgba(0, 0, 0, 0.5);
        z-index: 2;
      }
      .unit .feet {
        position: absolute;
        left: 10px;
        right: 10px;
        bottom: 0;
        display: flex;
        justify-content: space-between;
        z-index: 2;
        pointer-events: none;
      }
      .unit .feet::before,
      .unit .feet::after {
        content: "";
        width: 10px;
        height: 3px;
        background: #000;
        border-radius: 0 0 2px 2px;
      }
      .grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 14px;
      }
      .battery-card {
        display: flex;
        flex-direction: column;
      }
      .card {
        position: relative;
        background: rgba(15, 118, 110, 0.06);
        border-radius: var(--radius);
        padding: 12px;
        box-sizing: border-box;
      }
      .card.flat {
        box-shadow: none;
        padding: 0;
        overflow: visible;
      }
      .icon-corner {
        position: absolute;
        bottom: 14px;
        right: 14px;
        font-size: 22px;
        color: var(--text);
      }
      .title {
        display: flex;
        align-items: baseline;
        gap: 8px;
        font-weight: 600;
        color: var(--text);
        font-size: var(--ha-font-size-l);
        margin-bottom: 10px;
      }
      .right-big {
        margin-left: auto;
        font-weight: 400;
        font-size: 24px;
        color: var(--text);
      }
      .big-num {
        font-size: 24px;
        color: var(--text);
        font-weight: 400;
      }
      .big-num-unit {
        font-size: 14px;
        font-weight: 400;
        margin-left: 4px;
        color: var(--primary-text-color);
      }
      .big-num-unit.white {
        color: #fff;
      }
      .flex-wrapper {
        display: flex;
        align-items: baseline;
      }
      .subtitle {
        color: var(--muted);
        font-size: 13px;
        margin-top: 8px;
      }
      .barwrap {
        margin-top: 10px;
        display: flex;
        gap: 12px;
        align-items: center;
      }
      .bar {
        background: #1c1c1c;
        border-radius: 12px;
        height: 6px;
        flex: 1;
        position: relative;
        overflow: hidden;
      }
      .bar .fill {
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 0%;
        background: linear-gradient(90deg, var(--venus-teal), var(--venus-cyan-bright));
        border-radius: 12px;
        transition: width 0.6s ease;
      }
      .battery {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 10px 0 4px;
      }
      .ring {
        position: relative;
        width: 150px;
        height: 150px;
        border-radius: 50%;
        display: grid;
        place-items: center;
        padding: 6px;
        box-sizing: border-box;
        overflow: visible;
      }
      .ring > .inner {
        position: relative;
        z-index: 1;
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background-color: rgba(var(--ha-card-background-rgb, 28, 28, 28), 1);
        display: grid;
        place-items: center;
      }
      .kwh {
        font-size: 28px;
        font-weight: 400;
        color: #fff;
      }
      .percent {
        color: #fff;
        margin-top: 2px;
        font-weight: 400;
        font-size: var(--ha-font-size-l);
      }
      .pulse-amber {
        color: #fbbf24;
        scale: 0.85;
        animation: pulseOrange 2.5s infinite ease-in-out;
      }
      .row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        padding: 14px 18px;
      }
      .row .left {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .divider {
        height: 1px;
        background: var(--divider);
        margin: 0;
      }
      .compact {
        display: flex;
        align-items: center;
        background: var(--ha-card-background, var(--card-background-color, #fff));
        box-sizing: border-box;
        border-radius: var(--ha-card-border-radius, 12px);
        border: 1px solid var(--ha-card-border-color, var(--divider-color, #e0e0e0));
        color: var(--primary-text-color);
        padding: 10px 12px;
      }
      .compact .unit {
        transform: scale(0.55);
        transform-origin: center;
      }
      .compact .device {
        padding: 0;
        margin-left: 4px;
      }
      .compact .right {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-left: 8px;
        flex: 1;
      }
      .compact .name {
        font-weight: 700;
        font-size: 16px;
      }
      .compact .flex {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
      }
      .compact .val {
        display: flex;
        align-items: center;
        font-size: 12px;
        font-weight: 600;
        gap: 4px;
      }
      ha-icon[icon="mdi:battery-high"] {
        transform: rotate(90deg);
        transform-origin: center;
        display: inline-block;
      }
      .compact p {
        margin: 0;
        color: var(--muted);
      }
      @media (max-width: 700px) {
        .grid {
          grid-template-columns: 1fr;
        }
        .battery-card {
          grid-column: 1 / -1 !important;
          grid-row: auto !important;
        }
      }
    `;
  }

  setConfig(config) {
    this.config = {
      name: "Marstek Venus",
      subtitle: "Venus E 3.0",
      show_flow: true,
      grid: true,
      battery: true,
      ct: true,
      settings: true,
      icon: false,
      compact: false,
      entities: {},
      ...config,
    };
    this._configError = null;
    if (this._hass) {
      this._validate();
    } else {
      this._delayedValidation = true;
    }
  }

  _validate() {
    const lang = this._hass?.language || "en";
    const e = this.config?.entities;
    if (!e || !e.battery_soc) {
      this._configError = localize("errors.missing_entities", lang);
      return false;
    }
    this._configError = null;
    return true;
  }

  set hass(hass) {
    this._hass = hass;
    if (!this.config) return;

    const e = this.config.entities || {};
    this._soc = numState(hass, e.battery_soc);
    this._capWh = numState(hass, e.battery_capacity);
    this._grid = numState(hass, e.ongrid_power);
    this._offgrid = e.offgrid_power ? numState(hass, e.offgrid_power) : null;
    this._ctPower = e.ct_total_power ? numState(hass, e.ct_total_power) : null;
    this._ctConnected = e.ct_connected
      ? hass.states[e.ct_connected]?.state === "on"
      : null;
    this._batPower = e.battery_power ? numState(hass, e.battery_power) : null;
    this._modeText = e.operating_mode && hass.states[e.operating_mode]?.state ? hass.states[e.operating_mode].state : "";

    const bat = hass.states[e.battery_soc];
    this._lastUpdate = bat?.last_updated ? this._formatLastUpdate(bat.last_updated) : "";

    if (this._delayedValidation) {
      this._validate();
      this._delayedValidation = false;
    }
    this.requestUpdate();
  }

  _formatLastUpdate(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const h = String(d.getHours()).padStart(2, "0");
    const min = String(d.getMinutes()).padStart(2, "0");
    return `${y}-${m}-${day} ${h}:${min}`;
  }

  _handleMoreInfo(entityId) {
    if (!entityId) return;
    this.dispatchEvent(
      new CustomEvent("hass-more-info", {
        bubbles: true,
        composed: true,
        detail: { entityId },
      })
    );
  }

  _batteryClass() {
    const e = this.config.entities || {};
    // marstek_venus convention: battery_power positive = charging, negative = discharging.
    // Threshold: ignore values below 10 W to avoid jitter from idle noise.
    if (this._batPower !== null && Number.isFinite(this._batPower)) {
      if (this._batPower > 10 && this._soc < 100) return "charging";
      if (this._batPower < -10 && this._soc > 0) return "discharging";
      return "";
    }
    // Fallback when no battery_power entity is configured: use permission switches.
    const chOn = e.charge_permission && this._hass?.states[e.charge_permission]?.state === "on";
    const disOn = e.discharge_permission && this._hass?.states[e.discharge_permission]?.state === "on";
    if (chOn && this._soc < 100) return "charging";
    if (disOn && this._soc > 0 && this._soc < 100) return "discharging";
    return "";
  }

  _renderCTStatusPill(lang) {
    const e = this.config.entities || {};
    if (!e.ct_connected) return html``;
    let cls = "unknown";
    let label = localize("card.ct", lang);
    if (this._ctConnected === true) {
      cls = "ok";
      label = localize("card.ct_connected", lang);
    } else if (this._ctConnected === false) {
      cls = "bad";
      label = localize("card.ct_disconnected", lang);
    }
    return html`
      <div
        class="status-pill ${cls}"
        title="${label}"
        @click=${() => this._handleMoreInfo(e.ct_connected)}
      >
        <span class="dot"></span>
        <span>${label}</span>
      </div>
    `;
  }

  _renderHeader(lang) {
    const sub = (this.config.subtitle || "").trim();
    const line = sub || localize("labels.product_line", lang);
    const e = this.config.entities || {};
    const showStatusRow = Boolean(e.ct_connected);
    return html`
      <div style="width:100%;padding:0 12px;margin-bottom:4px;box-sizing:border-box;">
        <div style="font-weight:600;font-size:20px">${this.config.name}</div>
        <div class="product-line">${line}</div>
        <div style="font-size:11px;color:var(--muted);margin-top:6px;">
          ${localize("labels.last_update", lang)}: ${this._lastUpdate || "—"}
        </div>
        ${showStatusRow
          ? html`<div class="status-row">${this._renderCTStatusPill(lang)}</div>`
          : ""}
      </div>
    `;
  }

  _renderFlow(lang) {
    if (!this.config.show_flow) return html``;
    const e = this.config.entities || {};
    const chev = html`<div class="flow-chev"><ha-icon icon="mdi:chevron-right"></ha-icon></div>`;
    const nodes = [];

    if (this.config.grid) {
      const id = e.ongrid_power;
      const val = id ? `${Math.round(this._grid)}` : "—";
      nodes.push(html`
        <div class="flow-node" @click=${() => this._handleMoreInfo(id)}>
          <ha-icon icon="mdi:transmission-tower"></ha-icon>
          <span class="flow-label">${localize("card.grid", lang)}</span>
          <span class="flow-value">${val}</span>
          <span class="flow-unit">${id ? "W" : ""}</span>
        </div>
      `);
    }

    if (this._offgrid !== null && e.offgrid_power) {
      nodes.push(html`
        <div class="flow-node" @click=${() => this._handleMoreInfo(e.offgrid_power)}>
          <ha-icon icon="mdi:home-lightning-bolt-outline"></ha-icon>
          <span class="flow-label">${localize("card.offgrid", lang)}</span>
          <span class="flow-value">${Math.round(this._offgrid)}</span>
          <span class="flow-unit">W</span>
        </div>
      `);
    }

    if (this.config.ct && (e.ct_total_power || e.ct_connected)) {
      const disconnected = this._ctConnected === false;
      const id = e.ct_total_power || e.ct_connected;
      const val =
        this._ctPower !== null && !disconnected ? `${Math.round(this._ctPower)}` : "—";
      const label = disconnected
        ? localize("card.ct_disconnected", lang)
        : localize("card.ct", lang);
      nodes.push(html`
        <div
          class="flow-node ${disconnected ? "flow-node--warn" : ""}"
          @click=${() => this._handleMoreInfo(id)}
        >
          <ha-icon icon="${disconnected ? "mdi:alert-circle-outline" : "mdi:current-ac"}"></ha-icon>
          <span class="flow-label">${label}</span>
          <span class="flow-value">${val}</span>
          <span class="flow-unit">${val === "—" ? "" : "W"}</span>
        </div>
      `);
    }

    if (this.config.battery && e.battery_soc) {
      nodes.push(html`
        <div class="flow-node" @click=${() => this._handleMoreInfo(e.battery_soc)}>
          <ha-icon icon="mdi:battery-high"></ha-icon>
          <span class="flow-label">${localize("card.battery", lang)}</span>
          <span class="flow-value">${Math.round(this._soc)}</span>
          <span class="flow-unit">%</span>
        </div>
      `);
    }

    if (nodes.length < 2) return html``;

    const row = [];
    nodes.forEach((node, i) => {
      if (i) row.push(chev);
      row.push(node);
    });

    return html`
      <div class="flow-wrap">
        <div class="flow-caption">${localize("labels.flow_caption", lang)}</div>
        <div class="flow-row">${row}</div>
      </div>
    `;
  }

  _renderUnit(cls) {
    const soc = Math.max(0, Math.min(this._soc || 0, 100));
    let socCls = "";
    if (soc < 15) socCls = "soc-low";
    else if (soc < 50) socCls = "soc-mid";
    else if (soc >= 98) socCls = "soc-full";
    return html`
      <div class="unit ${cls} ${socCls}">
        <div class="case-glow" style="height:${soc}%"></div>
        <div class="led-strip">
          <span class="led-dots"></span>
          <div class="led-track">
            <div class="led-fill" style="width:${soc}%"></div>
          </div>
          <span class="led-dots"></span>
        </div>
        <div class="brand">MARSTEK</div>
        <div class="feet"></div>
      </div>
    `;
  }

  _renderGrid(lang) {
    const e = this.config.entities;
    return html`
      <article class="card" @click=${() => this._handleMoreInfo(e.ongrid_power)}>
        <div class="title">${localize("card.grid", lang)}</div>
        <div class="subtitle">${localize("card.realtime", lang)}</div>
        <div class="flex-wrapper">
          <div class="big-num">${Number(this._grid).toFixed(0)}</div>
          <div class="big-num-unit">W</div>
        </div>
        <div class="icon-corner"><ha-icon icon="mdi:transmission-tower"></ha-icon></div>
      </article>
    `;
  }

  _renderOffgrid(lang) {
    if (this._offgrid === null) return html``;
    const e = this.config.entities;
    return html`
      <article class="card" @click=${() => this._handleMoreInfo(e.offgrid_power)}>
        <div class="title">${localize("card.offgrid", lang)}</div>
        <div class="subtitle">${localize("card.realtime", lang)}</div>
        <div class="flex-wrapper">
          <div class="big-num">${Number(this._offgrid).toFixed(0)}</div>
          <div class="big-num-unit">W</div>
        </div>
        <div class="icon-corner"><ha-icon icon="mdi:home-lightning-bolt-outline"></ha-icon></div>
      </article>
    `;
  }

  _renderCT(lang) {
    if (!this.config.ct) return html``;
    const e = this.config.entities;
    if (!e.ct_total_power && !e.ct_connected) return html``;
    const disconnected = this._ctConnected === false;
    const id = e.ct_total_power || e.ct_connected;
    const value =
      this._ctPower !== null && !disconnected ? Number(this._ctPower).toFixed(0) : "—";
    const subtitle = disconnected
      ? localize("card.ct_disconnected", lang)
      : localize("card.realtime", lang);
    return html`
      <article class="card" @click=${() => this._handleMoreInfo(id)}>
        <div class="title">${localize("card.ct", lang)}</div>
        <div class="subtitle" style="${disconnected ? "color:#f59e0b" : ""}">${subtitle}</div>
        <div class="flex-wrapper">
          <div class="big-num">${value}</div>
          <div class="big-num-unit">${value === "—" ? "" : "W"}</div>
        </div>
        <div class="icon-corner">
          <ha-icon
            icon="${disconnected ? "mdi:alert-circle-outline" : "mdi:current-ac"}"
            style="${disconnected ? "color:#f59e0b" : ""}"
          ></ha-icon>
        </div>
      </article>
    `;
  }

  _leftColumnRows() {
    let n = 0;
    if (this.config.grid) n += 1;
    if (this._offgrid !== null) n += 1;
    if (this._ctVisible()) n += 1;
    return n;
  }

  _ctVisible() {
    if (!this.config.ct) return false;
    const e = this.config.entities || {};
    return Boolean(e.ct_total_power || e.ct_connected);
  }

  _batteryFullWidth() {
    return this.config.battery && this._leftColumnRows() === 0;
  }

  _renderBattery(lang) {
    const e = this.config.entities;
    const kwh = (this._capWh || 0) / 1000;
    const cls = this._batteryClass();
    const showBolt = cls === "charging";
    const leftRows = this._leftColumnRows();
    const fullW = this._batteryFullWidth();
    const span = Math.max(leftRows, 1);
    const place = fullW
      ? "grid-column: 1 / -1;"
      : `grid-column: 2; grid-row: 1 / span ${span};`;
    return html`
      <article class="card battery-card" style="${place}">
        <div class="title">${localize("card.battery", lang)}</div>
        <div class="battery">
          <div
            class="ring"
            style="background: conic-gradient(
              #b45309 0 ${Math.min(this._soc, 15)}%,
              #f59e0b ${Math.min(this._soc, 45)}%,
              var(--venus-cyan-bright) ${Math.min(this._soc, 92)}%,
              #0f766e ${Math.min(this._soc, 100)}%,
              #0c4a43 ${this._soc}% 100%
            );"
            @click=${() => this._handleMoreInfo(e.battery_soc)}
          >
            <div class="inner">
              ${showBolt
                ? html`<ha-icon
                    icon="mdi:lightning-bolt"
                    class="pulse-amber"
                    style="position:absolute;top:8px;left:50%;transform:translateX(-50%);"
                  ></ha-icon>`
                : ""}
              <div style="text-align:center;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;">
                <div class="flex-wrapper">
                  <div class="kwh">${kwh.toFixed(2)}</div>
                  <div class="big-num-unit white">kWh</div>
                </div>
                <div class="percent">${Math.round(this._soc)}%</div>
              </div>
            </div>
          </div>
          <div class="icon-corner"><ha-icon icon="mdi:battery-high"></ha-icon></div>
        </div>
      </article>
    `;
  }

  _renderCustomSettings() {
    const items = this.config.custom_settings;
    if (!items?.length || !this._hass) return html``;
    return html`
      ${items.map((item, index) => {
        const entity = this._hass.states[item.entity];
        if (!entity) return html``;
        const icon = item.icon || entity.attributes.icon;
        const name = item.name || entity.attributes.friendly_name || item.entity;
        const div =
          index < items.length - 1 ? html`<div class="divider"></div>` : html``;
        if (entity.entity_id.startsWith("switch.")) {
          return html`
            <div class="row">
              <div class="left">
                ${icon ? html`<ha-icon icon="${icon}"></ha-icon>` : ""}
                <div style="font-weight:600">${name}</div>
              </div>
              <ha-switch
                .checked=${entity.state === "on"}
                @change=${(ev) => {
                  const on = ev.target.checked;
                  this._hass.callService("switch", on ? "turn_on" : "turn_off", {
                    entity_id: entity.entity_id,
                  });
                }}
              ></ha-switch>
            </div>
            ${div}
          `;
        }
        if (entity.entity_id.startsWith("select.")) {
          return html`
            <div class="row">
              <div class="left">
                ${icon ? html`<ha-icon icon="${icon}"></ha-icon>` : ""}
                <div style="font-weight:600">${name}</div>
              </div>
              <ha-select
                .value=${entity.state}
                @closed=${(ev) => {
                  const val = ev.target.value;
                  if (val && val !== entity.state) {
                    this._hass.callService("select", "select_option", {
                      entity_id: entity.entity_id,
                      option: val,
                    });
                  }
                }}
              >
                ${(entity.attributes?.options || []).map(
                  (opt) => html`<mwc-list-item value=${opt}>${opt}</mwc-list-item>`
                )}
              </ha-select>
            </div>
            ${div}
          `;
        }
        return html`
          <div class="row">
            <div class="left">
              ${icon ? html`<ha-icon icon="${icon}"></ha-icon>` : ""}
              <div style="font-weight:600">${name}</div>
            </div>
            <div class="flex-wrapper">
              <div class="big-num">${entity.state}</div>
              <div class="big-num-unit">${entity.attributes.unit_of_measurement || ""}</div>
            </div>
          </div>
          ${div}
        `;
      })}
    `;
  }

  _renderSettings(lang) {
    const e = this.config.entities;
    const sel = e.mode_select ? this._hass?.states[e.mode_select] : null;
    const hasCustom = this.config.custom_settings?.length && this._hass;
    if (!this.config.settings && !hasCustom) return html``;
    const modeBlock =
      this.config.settings && sel
        ? html`
            <div class="row">
              <div class="left">
                <ha-icon icon="mdi:tune-variant"></ha-icon>
                <div style="font-weight:600">${localize("labels.mode", lang)}</div>
              </div>
              <ha-select
                .value=${sel.state}
                @closed=${(ev) => {
                  const val = ev.target.value;
                  if (val && val !== sel.state) {
                    this._hass.callService("select", "select_option", {
                      entity_id: sel.entity_id,
                      option: val,
                    });
                  }
                }}
              >
                ${(sel.attributes?.options || []).map(
                  (opt) => html`<mwc-list-item value=${opt}>${opt}</mwc-list-item>`
                )}
              </ha-select>
            </div>
          `
        : html``;
    const customBlock = this._renderCustomSettings();
    const dividerAfterMode =
      this.config.settings && sel && hasCustom ? html`<div class="divider"></div>` : html``;
    return html`
      <div class="card flat" style="grid-column:1 / -1">
        ${modeBlock}
        ${dividerAfterMode}
        ${customBlock}
      </div>
    `;
  }

  _renderCompact(bcls) {
    const e = this.config.entities;
    let color = "#22c55e";
    if (this._soc <= 20) color = "#ef4444";
    else if (this._soc <= 55) color = "#f97316";
    let icon = "mdi:battery-50";
    if (this._soc >= 100) icon = "mdi:battery";
    else if (this._soc < 10) icon = "mdi:battery-outline";
    else icon = `mdi:battery-${Math.floor(this._soc / 10) * 10}`;
    const showCT = Boolean(e.ct_connected);
    const ctOk = this._ctConnected === true;
    const ctBad = this._ctConnected === false;
    const ctColor = ctOk ? "#10b981" : ctBad ? "#ef4444" : "var(--muted)";
    const ctIcon = ctBad ? "mdi:alert-circle-outline" : "mdi:current-ac";
    return html`
      <div class="compact" @click=${() => this._handleMoreInfo(e.battery_soc)}>
        <div class="device">${this._renderUnit(bcls)}</div>
        <div class="right">
          <div class="name">${this.config.name}</div>
          <div class="flex">
            <div class="val">
              <ha-icon icon="mdi:transmission-tower"></ha-icon>
              <p>${Math.round(this._grid)} W</p>
            </div>
            <div class="val">
              <ha-icon icon="${icon}" style="color:${color}"></ha-icon>
              <p>${Math.round(this._soc)} %</p>
            </div>
            ${showCT
              ? html`
                  <div
                    class="val"
                    @click=${(ev) => {
                      ev.stopPropagation();
                      this._handleMoreInfo(e.ct_connected);
                    }}
                  >
                    <ha-icon icon="${ctIcon}" style="color:${ctColor}"></ha-icon>
                    <p>${ctBad ? localize("card.ct_disconnected", this._hass?.language || "en") : "CT"}</p>
                  </div>
                `
              : ""}
          </div>
        </div>
      </div>
    `;
  }

  render() {
    if (this._configError) {
      return html`<ha-alert alert-type="error">${this._configError}</ha-alert>`;
    }
    const lang = this._hass?.language || "en";
    const bcls = this._batteryClass();

    if (this.config.compact) {
      return this._renderCompact(bcls);
    }

    return html`
      <div class="container">
        <div class="device">
          ${this._renderHeader(lang)}
          ${this._renderFlow(lang)}
          ${this.config.icon ? this._renderUnit(bcls) : ""}
        </div>
        <section class="grid">
          ${this.config.grid ? this._renderGrid(lang) : ""}
          ${this.config.battery ? this._renderBattery(lang) : ""}
          ${this._offgrid !== null ? this._renderOffgrid(lang) : ""}
          ${this._ctVisible() ? this._renderCT(lang) : ""}
          ${this._renderSettings(lang)}
        </section>
      </div>
    `;
  }

  static getConfigElement() {
    return document.createElement("venuse3-card-editor");
  }

  getCardSize() {
    return 4;
  }
}

customElements.define("venuse3-card", Venuse3Card);

class Venuse3CardEditor extends LitElement {
  static get properties() {
    return {
      _config: { type: Object },
      hass: { type: Object },
    };
  }

  setConfig(config) {
    this._config = {
      name: "Marstek Venus",
      subtitle: "Venus E 3.0",
      show_flow: true,
      grid: true,
      battery: true,
      ct: true,
      settings: true,
      icon: false,
      compact: false,
      entities: {
        battery_soc: "",
        battery_capacity: "",
        battery_power: "",
        ongrid_power: "",
        offgrid_power: "",
        ct_total_power: "",
        ct_connected: "",
        operating_mode: "",
        mode_select: "",
        charge_permission: "",
        discharge_permission: "",
      },
      ...config,
    };
  }

  set hass(hass) {
    this._hass = hass;
  }

  _valueChanged(ev) {
    if (!this._config) return;
    const newConfig = { ...ev.detail.value };
    this._config = newConfig;
    this.dispatchEvent(
      new CustomEvent("config-changed", {
        detail: { config: this._config },
        bubbles: true,
        composed: true,
      })
    );
  }

  _computeLabel(field) {
    const name = field?.name || field;
    const lang = this._hass?.locale?.language || this._hass?.language || "en";
    return localize(`editor.${name}`, lang);
  }

  _computeHelper(field) {
    const name = field?.name || field;
    const lang = this._hass?.locale?.language || this._hass?.language || "en";
    return localize(`helpers.${name}`, lang);
  }

  render() {
    if (!this._config) return html``;
    const schema = [
      { name: "name", selector: { text: {} } },
      { name: "subtitle", selector: { text: {} } },
      { name: "show_flow", selector: { boolean: {} } },
      {
        name: "entities",
        selector: {
          object: {
            properties: {
              battery_soc: { selector: { entity: { domain: "sensor" } } },
              battery_capacity: { selector: { entity: { domain: "sensor" } } },
              battery_power: { selector: { entity: { domain: "sensor" } } },
              ongrid_power: { selector: { entity: { domain: "sensor" } } },
              offgrid_power: { selector: { entity: { domain: "sensor" } } },
              ct_total_power: { selector: { entity: { domain: "sensor" } } },
              ct_connected: { selector: { entity: { domain: "binary_sensor" } } },
              operating_mode: { selector: { entity: { domain: "sensor" } } },
              mode_select: { selector: { entity: { domain: "select" } } },
              charge_permission: { selector: { entity: { domain: "switch" } } },
              discharge_permission: { selector: { entity: { domain: "switch" } } },
            },
          },
        },
      },
      {
        name: "custom_settings",
        selector: {
          object: {
            properties: {
              entity: { selector: { entity: {} } },
              name: { selector: { text: {} } },
              icon: { selector: { text: {} } },
            },
          },
        },
      },
      { name: "compact", selector: { boolean: {} } },
      { name: "icon", selector: { boolean: {} } },
      { name: "grid", selector: { boolean: {} } },
      { name: "battery", selector: { boolean: {} } },
      { name: "ct", selector: { boolean: {} } },
      { name: "settings", selector: { boolean: {} } },
    ];

    return html`
      <ha-form
        .hass=${this._hass}
        .data=${this._config}
        .schema=${schema}
        .computeLabel=${(f) => this._computeLabel(f)}
        .computeHelper=${(f) => this._computeHelper(f)}
        @value-changed=${this._valueChanged}
      ></ha-form>
    `;
  }
}

customElements.define("venuse3-card-editor", Venuse3CardEditor);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "venuse3-card",
  name: "Venus E 3.0 Card",
  preview: false,
  description: "Dashboard card for Marstek Venus E 3.0 (marstek_venus)",
});
