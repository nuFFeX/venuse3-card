import { LitElement, html, css } from "https://unpkg.com/lit-element/lit-element.js?module";
import en from "./localize/en.js";
import de from "./localize/de.js";

const languages = { en, de };

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

function energyToKwh(hass, entityId) {
  if (!entityId || !hass?.states[entityId]) return 0;
  const st = hass.states[entityId];
  const value = Number(st.state) || 0;
  const u = (st.attributes?.unit_of_measurement || "").toLowerCase();
  if (u === "kwh") return value;
  if (u === "wh" || u === "w·h") return value / 1000;
  return value / 1000;
}

class Venuse3Card extends LitElement {
  static get styles() {
    return css`
      :host {
        --text: var(--primary-text-color);
        --muted: var(--secondary-text-color, var(--primary-text-color));
        --divider: var(--entities-divider-color, var(--divider-color));
        --radius: 22px;
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
      .unit {
        width: 80px;
        height: 130px;
        border-radius: 18px;
        background: linear-gradient(135deg, #3d5a80 0%, #293241 50%, #3d5a80 100%);
        box-shadow: inset 0 2px 0 rgba(255, 255, 255, 0.06), inset 0 -8px 16px rgba(0, 0, 0, 0.45);
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .unit .battery-bar {
        width: 10px;
        height: 80px;
        border-radius: 6px;
        border: 1px solid #000;
        background: rgb(28, 28, 28);
        position: relative;
        overflow: hidden;
        display: flex;
        justify-content: center;
      }
      .unit .battery-fill {
        position: absolute;
        bottom: 2px;
        width: 4px;
        background: linear-gradient(#7dd3fc, #38bdf8);
        box-shadow: 0 0 4px #38bdf8;
        border-radius: 2px;
        height: 0%;
        transition: height 0.6s ease;
      }
      .unit .battery-fill.charging {
        animation: pulseBlue 2.5s infinite ease-in-out;
      }
      .unit .battery-fill.discharging {
        background: linear-gradient(#fb923c, #ea580c);
        box-shadow: 0 0 4px #fb923c;
        animation: pulseOrange 2.5s infinite ease-in-out;
      }
      @keyframes pulseBlue {
        0%,
        100% {
          opacity: 0.65;
          transform: scaleY(0.96);
        }
        50% {
          opacity: 1;
          transform: scaleY(1.04);
        }
      }
      @keyframes pulseOrange {
        0%,
        100% {
          opacity: 0.65;
          transform: scaleY(0.96);
        }
        50% {
          opacity: 1;
          transform: scaleY(1.04);
        }
      }
      .grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 14px;
      }
      .solar {
        grid-column: 1 / -1;
        padding: 18px;
      }
      .battery-card {
        display: flex;
        flex-direction: column;
      }
      .card {
        position: relative;
        background: rgba(100, 100, 100, 0.12);
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
        background: #38bdf8;
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
          grid-row: auto;
        }
      }
    `;
  }

  setConfig(config) {
    this.config = {
      name: "Venus E 3.0",
      solar: true,
      grid: true,
      battery: true,
      energy: true,
      settings: true,
      icon: true,
      compact: false,
      max_pv_power: 6000,
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
    this._pv = numState(hass, e.pv_power);
    this._grid = numState(hass, e.ongrid_power);
    this._offgrid = e.offgrid_power ? numState(hass, e.offgrid_power) : null;
    this._pvKwhTotal = e.total_pv_energy ? energyToKwh(hass, e.total_pv_energy) : 0;
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
    const chOn = e.charge_permission && this._hass?.states[e.charge_permission]?.state === "on";
    const disOn = e.discharge_permission && this._hass?.states[e.discharge_permission]?.state === "on";
    if (chOn && this._soc < 100) return "charging";
    if (disOn && this._soc > 0) return "discharging";
    if (this._pv > this._grid && this._soc < 100) return "charging";
    if (this._grid > this._pv && this._soc > 0) return "discharging";
    return "";
  }

  _renderHeader(lang) {
    return html`
      <div style="display:grid;width:100%;padding:0 12px;margin-bottom:6px;">
        <div style="font-weight:600;font-size:20px">${this.config.name}</div>
        <div style="font-size:11px;color:var(--muted);">
          ${localize("labels.last_update", lang)}: ${this._lastUpdate || "—"}
        </div>
      </div>
    `;
  }

  _renderUnit(cls) {
    return html`
      <div class="unit">
        <div class="battery-bar">
          <div class="battery-fill ${cls}" style="height:${Math.min(this._soc, 98)}%"></div>
        </div>
      </div>
    `;
  }

  _renderSolar(lang) {
    const maxW = this.config.max_pv_power || 6000;
    const pct = Math.min(100, Math.round((this._pv / maxW) * 100));
    const e = this.config.entities;
    return html`
      <article class="card solar">
        <div class="title">
          ${localize("card.solar", lang)}
          <div
            class="right-big"
            @click=${() => this._handleMoreInfo(e.pv_power)}
          >
            ${Math.round(this._pv)}
          </div>
          <div class="big-num-unit">W</div>
        </div>
        <div class="subtitle">${localize("card.realtime", lang)}</div>
        <div class="barwrap">
          <div class="bar"><div class="fill" style="width:${pct}%"></div></div>
        </div>
        <div class="icon-corner"><ha-icon icon="mdi:solar-power-variant-outline"></ha-icon></div>
      </article>
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

  _leftColumnRows() {
    let n = 0;
    if (this.config.grid) n += 1;
    if (this._offgrid !== null) n += 1;
    if (this.config.energy && this.config.entities.total_pv_energy) n += 1;
    return n;
  }

  _batteryGridStartRow() {
    return this.config.solar ? 2 : 1;
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
    const startRow = this._batteryGridStartRow();
    const place = fullW
      ? "grid-column: 1 / -1;"
      : `grid-column: 2; grid-row: ${startRow} / span ${span};`;
    return html`
      <article class="card battery-card" style="${place}">
        <div class="title">${localize("card.battery", lang)}</div>
        <div class="battery">
          <div
            class="ring"
            style="background: conic-gradient(
              #ef4444 0 ${Math.min(this._soc, 12)}%,
              #f97316 ${Math.min(this._soc, 40)}%,
              #38bdf8 ${Math.min(this._soc, 100)}%,
              #0f172a ${this._soc}% 100%
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

  _renderEnergy(lang) {
    const e = this.config.entities;
    return html`
      <article class="card" @click=${() => this._handleMoreInfo(e.total_pv_energy)}>
        <div class="title">${localize("card.energy", lang)}</div>
        <div class="subtitle">${localize("card.total", lang)}</div>
        <div class="flex-wrapper">
          <div class="big-num">${this._pvKwhTotal.toFixed(2)}</div>
          <div class="big-num-unit">kWh</div>
        </div>
        <div class="icon-corner"><ha-icon icon="mdi:chart-areaspline"></ha-icon></div>
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
                @selected=${(ev) => {
                  const val = ev.target.value;
                  this._hass.callService("select", "select_option", {
                    entity_id: entity.entity_id,
                    option: val,
                  });
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
                @selected=${(ev) => {
                  this._hass.callService("select", "select_option", {
                    entity_id: sel.entity_id,
                    option: ev.target.value,
                  });
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
    return html`
      <div class="compact" @click=${() => this._handleMoreInfo(e.battery_soc)}>
        <div class="device">${this._renderUnit(bcls)}</div>
        <div class="right">
          <div class="name">${this.config.name}</div>
          <div class="flex">
            <div class="val">
              <ha-icon icon="mdi:solar-power"></ha-icon>
              <p>${Math.round(this._pv)} W</p>
            </div>
            <div class="val">
              <ha-icon icon="mdi:transmission-tower"></ha-icon>
              <p>${Math.round(this._grid)} W</p>
            </div>
            <div class="val">
              <ha-icon icon="${icon}" style="color:${color}"></ha-icon>
              <p>${Math.round(this._soc)} %</p>
            </div>
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
          ${this.config.icon ? this._renderUnit(bcls) : ""}
        </div>
        <section class="grid">
          ${this.config.solar ? this._renderSolar(lang) : ""}
          ${this.config.grid ? this._renderGrid(lang) : ""}
          ${this.config.battery ? this._renderBattery(lang) : ""}
          ${this._offgrid !== null ? this._renderOffgrid(lang) : ""}
          ${this.config.energy && this.config.entities.total_pv_energy ? this._renderEnergy(lang) : ""}
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
      name: "Venus E 3.0",
      solar: true,
      grid: true,
      battery: true,
      energy: true,
      settings: true,
      icon: true,
      compact: false,
      max_pv_power: 6000,
      entities: {
        battery_soc: "",
        battery_capacity: "",
        pv_power: "",
        ongrid_power: "",
        offgrid_power: "",
        total_pv_energy: "",
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
      {
        name: "entities",
        selector: {
          object: {
            properties: {
              battery_soc: { selector: { entity: { domain: "sensor" } } },
              battery_capacity: { selector: { entity: { domain: "sensor" } } },
              pv_power: { selector: { entity: { domain: "sensor" } } },
              ongrid_power: { selector: { entity: { domain: "sensor" } } },
              offgrid_power: { selector: { entity: { domain: "sensor" } } },
              total_pv_energy: { selector: { entity: { domain: "sensor" } } },
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
      { name: "solar", selector: { boolean: {} } },
      { name: "grid", selector: { boolean: {} } },
      { name: "battery", selector: { boolean: {} } },
      { name: "energy", selector: { boolean: {} } },
      { name: "settings", selector: { boolean: {} } },
      { name: "max_pv_power", selector: { number: { min: 100, max: 50000, step: 100 } } },
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
