import { Router } from "express";
import { HA_URL, HA_TOKEN } from "../config.js";

const router = Router();

async function fetchState(entity) {
  const response = await fetch(`${HA_URL}/api/states/${entity}`, {
    headers: {
      Authorization: `Bearer ${HA_TOKEN}`,
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) throw new Error(`HA ${response.status} for ${entity}`);
  return response.json();
}

const CLIMATE_ENTITIES = [
  { id: "climate.1st_floor_ac", name: "1st Floor" },
  { id: "climate.2nd_floor_ac", name: "2nd Floor" },
  { id: "climate.3rd_floor_ac", name: "3rd Floor" },
  { id: "climate.guest_room_ac", name: "Guest" },
];

const PERSON_ENTITIES = [
  { id: "person.evan", name: "Evan" },
  { id: "person.elizabeth", name: "Elizabeth" },
];

const PRINTER_ENTITIES = [
  "sensor.a1_03919c442700723_print_status",
  "sensor.a1_03919c442700723_print_progress",
  "sensor.a1_03919c442700723_remaining_time",
  "sensor.a1_03919c442700723_task_name",
  "sensor.a1_finish_time",
];

const WEATHER_SENSORS = [
  "sensor.kbos_temperature",
  "sensor.kbos_relative_humidity",
  "sensor.kbos_barometric_pressure",
  "sensor.kbos_wind_speed",
  "sensor.kbos_wind_direction",
];

const ENERGY_ENTITIES = [
  "sensor.envoy_482518016321_current_power_production",
  "sensor.envoy_482518016321_current_power_consumption",
  "sensor.envoy_482518016321_energy_production_today",
  "sensor.envoy_482518016321_energy_consumption_today",
];

export async function fetchHomeData() {
  const allEntityIds = [
    "weather.kbos",
    ...WEATHER_SENSORS,
    ...CLIMATE_ENTITIES.map((e) => e.id),
    ...PERSON_ENTITIES.map((e) => e.id),
    ...PRINTER_ENTITIES,
    ...ENERGY_ENTITIES,
  ];

  const results = await Promise.allSettled(allEntityIds.map(fetchState));

  const byId = {};
  allEntityIds.forEach((id, i) => {
    if (results[i].status === "fulfilled") {
      byId[id] = results[i].value;
    }
  });

  // Weather
  const wx = byId["weather.kbos"];
  const weather = wx
    ? {
        state: wx.state,
        temperature: parseFloat(byId["sensor.kbos_temperature"]?.state) || (wx.attributes?.temperature ?? null),
        humidity: parseFloat(byId["sensor.kbos_relative_humidity"]?.state) || (wx.attributes?.humidity ?? null),
        windSpeed: parseFloat(byId["sensor.kbos_wind_speed"]?.state) || null,
        windDirection: parseFloat(byId["sensor.kbos_wind_direction"]?.state) || null,
        pressure: parseFloat(byId["sensor.kbos_barometric_pressure"]?.state) || null,
      }
    : null;

  // Climate
  const climate = CLIMATE_ENTITIES.map(({ id, name }) => {
    const d = byId[id];
    return {
      name,
      state: d?.state ?? "unknown",
      currentTemp: d?.attributes?.current_temperature ?? null,
      targetTemp: d?.attributes?.temperature ?? null,
      hvacMode: d?.attributes?.hvac_mode ?? d?.state ?? null,
    };
  });

  // People
  const people = PERSON_ENTITIES.map(({ id, name }) => ({
    name,
    state: byId[id]?.state ?? "unknown",
  }));

  // Printer
  const printerStatus =
    byId["sensor.a1_03919c442700723_print_status"]?.state ?? "unknown";
  const printer = {
    status: printerStatus,
    progress:
      parseFloat(byId["sensor.a1_03919c442700723_print_progress"]?.state) ||
      0,
    remainingTime:
      parseFloat(byId["sensor.a1_03919c442700723_remaining_time"]?.state) ||
      0,
    taskName: byId["sensor.a1_03919c442700723_task_name"]?.state ?? null,
    finishTime: byId["sensor.a1_finish_time"]?.state ?? null,
  };

  // Energy
  const energy = {
    currentProduction:
      parseFloat(
        byId["sensor.envoy_482518016321_current_power_production"]?.state,
      ) || 0,
    currentConsumption:
      parseFloat(
        byId["sensor.envoy_482518016321_current_power_consumption"]?.state,
      ) || 0,
    productionToday:
      parseFloat(
        byId["sensor.envoy_482518016321_energy_production_today"]?.state,
      ) || 0,
    consumptionToday:
      parseFloat(
        byId["sensor.envoy_482518016321_energy_consumption_today"]?.state,
      ) || 0,
  };

  return { weather, climate, people, printer, energy };
}

router.get("/", async (_req, res) => {
  if (!HA_TOKEN) {
    res.status(503).json({ error: "HA_TOKEN not configured" });
    return;
  }

  try {
    const data = await fetchHomeData();
    res.json(data);
  } catch (err) {
    console.error("Home fetch error:", err);
    res.status(500).json({ error: "Failed to fetch home data" });
  }
});

export default router;
