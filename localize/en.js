export default {
  errors: {
    missing_entities: "Provide an entities object with at least battery_soc.",
  },
  labels: {
    last_update: "Last update",
    mode: "Operating mode",
    charge_hint: "Charge",
    discharge_hint: "Discharge",
  },
  card: {
    solar: "Solar",
    grid: "Grid",
    offgrid: "Off-grid",
    battery: "Battery",
    energy: "Solar energy (total)",
    total: "Total",
    realtime: "Realtime power",
    settings: "Settings",
  },
  editor: {
    name: "Card title",
    entities: "Entities",
    compact: "Compact layout",
    icon: "Show device icon",
    solar: "Show solar",
    grid: "Show grid",
    battery: "Show battery",
    energy: "Show total solar energy",
    settings: "Show settings (mode select)",
    max_pv_power: "PV bar full scale (W)",
    custom_settings: "Custom rows (entity / name / icon)",
  },
  helpers: {
    entities: "Map integration entities (see README for marstek_venus keys).",
    max_pv_power: "Upper limit for the solar power progress bar.",
    custom_settings: "Extra sensor / switch / select rows at the bottom.",
  },
};
