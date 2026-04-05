import { useEffect, useState } from "react";
import { api } from "../api";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell
} from "recharts";

export default function ExternalDataWidget({ district, crop }) {
  const [envData,   setEnvData]   = useState(null);
  const [priceData, setPriceData] = useState(null);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState(null);

  useEffect(() => {
    if (!district) return;
    setLoading(true);
    setError(null);

    Promise.all([
      api.get(`/environment?district=${encodeURIComponent(district)}`),
      crop ? api.get(`/market-price?crop=${encodeURIComponent(crop)}`) : Promise.resolve(null),
    ])
      .then(([envRes, priceRes]) => {
        setEnvData(envRes.data);
        if (priceRes) setPriceData(priceRes.data);
      })
      .catch(() => setError("Could not load live data"))
      .finally(() => setLoading(false));
  }, [district, crop]);

  if (loading) return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center gap-3 text-gray-400">
        <div className="w-5 h-5 border-2 border-gray-300 border-t-green-500 rounded-full animate-spin" />
        <span className="text-sm">Fetching live satellite & market data…</span>
      </div>
    </div>
  );

  if (error) return (
    <div className="bg-red-50 border border-red-100 rounded-2xl p-4 text-sm text-red-600">
      ⚠️ {error}
    </div>
  );

  if (!envData) return null;

  const ndvi         = envData.ndvi;
  const soilMoisture = envData.soil_moisture;
  const rain7d       = envData.total_rain_7d;
  const forecast     = envData.forecast || [];

  // NDVI colour
  const ndviColor = ndvi >= 0.6 ? "text-emerald-600" : ndvi >= 0.4 ? "text-amber-600" : "text-red-600";
  const ndviLabel = ndvi >= 0.6 ? "Healthy" : ndvi >= 0.4 ? "Moderate" : "Stressed";
  const ndviBar   = ndvi >= 0.6 ? "bg-emerald-500" : ndvi >= 0.4 ? "bg-amber-400" : "bg-red-400";

  // Soil moisture colour
  const smColor = soilMoisture >= 50 ? "text-emerald-600" : soilMoisture >= 30 ? "text-amber-600" : "text-red-600";
  const smLabel = soilMoisture >= 50 ? "Adequate" : soilMoisture >= 30 ? "Low" : "Very Low";

  // Forecast chart colours
  const rainColors = forecast.map(d =>
    d.rainfall_mm > 10 ? "#3b82f6" : d.rainfall_mm > 3 ? "#60a5fa" : "#bfdbfe"
  );

  return (
    <div className="space-y-3">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-500 rounded-2xl px-5 py-3 text-white">
        <h3 className="font-bold text-base">🛰️ Live Satellite & Market Data</h3>
        <p className="text-indigo-100 text-xs mt-0.5">{district} · NASA POWER · Open-Meteo · Agmarknet</p>
      </div>

      {/* ── NDVI + Soil Moisture ────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
          🌿 Vegetation & Soil (NASA POWER)
        </p>
        <div className="grid grid-cols-2 gap-3">

          {/* NDVI */}
          <div className="bg-gray-50 rounded-xl p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-500">NDVI Index</span>
              <span className={`text-xs font-bold ${ndviColor}`}>{ndviLabel}</span>
            </div>
            <p className={`text-2xl font-bold ${ndviColor}`}>{ndvi ?? "—"}</p>
            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
              <div className={`h-1.5 rounded-full ${ndviBar}`}
                style={{ width: `${Math.min(100, (ndvi ?? 0) * 100)}%` }} />
            </div>
            <p className="text-xs text-gray-400 mt-1">0 = bare · 1 = dense vegetation</p>
          </div>

          {/* Soil Moisture */}
          <div className="bg-gray-50 rounded-xl p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-500">Soil Moisture</span>
              <span className={`text-xs font-bold ${smColor}`}>{smLabel}</span>
            </div>
            <p className={`text-2xl font-bold ${smColor}`}>{soilMoisture != null ? `${soilMoisture}%` : "—"}</p>
            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
              <div className={`h-1.5 rounded-full ${soilMoisture >= 50 ? "bg-emerald-500" : soilMoisture >= 30 ? "bg-amber-400" : "bg-red-400"}`}
                style={{ width: `${soilMoisture ?? 0}%` }} />
            </div>
            <p className="text-xs text-gray-400 mt-1">Root zone wetness</p>
          </div>
        </div>

        {/* 7-day rainfall from NASA */}
        {rain7d != null && (
          <div className="mt-3 flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2">
            <span className="text-xl">🌧️</span>
            <div>
              <p className="text-xs text-gray-500">Last 7-day Rainfall (NASA)</p>
              <p className="text-sm font-bold text-blue-700">{rain7d} mm</p>
            </div>
          </div>
        )}
      </div>

      {/* ── 7-day Forecast (Open-Meteo / IMD-equivalent) ───────────────── */}
      {forecast.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
            🌦️ 7-Day Rainfall Forecast (IMD-equivalent)
          </p>
          <p className="text-xs text-gray-400 mb-3">
            Total: <strong className="text-blue-600">{rain7d} mm</strong> · Avg temp: <strong className="text-amber-600">{envData.avg_temp_7d}°C</strong>
          </p>

          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={forecast} barSize={20} margin={{ top:0, right:0, left:-28, bottom:0 }}>
                <XAxis
                  dataKey="date"
                  tick={{ fontSize:9, fill:"#9ca3af" }}
                  tickFormatter={d => d.slice(5)}
                  axisLine={false} tickLine={false}
                />
                <YAxis tick={{ fontSize:9, fill:"#9ca3af" }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(v) => [`${v} mm`, "Rain"]}
                  labelFormatter={l => l}
                  contentStyle={{ borderRadius:8, border:"none", boxShadow:"0 4px 12px rgba(0,0,0,0.1)", fontSize:11 }}
                />
                <Bar dataKey="rainfall_mm" radius={[4,4,0,0]}>
                  {forecast.map((_, i) => <Cell key={i} fill={rainColors[i]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Daily forecast pills */}
          <div className="flex gap-1.5 mt-2 overflow-x-auto pb-1">
            {forecast.map((d, i) => (
              <div key={i} className="shrink-0 bg-gray-50 rounded-xl px-2.5 py-2 text-center min-w-[52px]">
                <p className="text-xs text-gray-400">{d.date.slice(5)}</p>
                <p className="text-xs font-bold text-blue-600">{d.rainfall_mm}mm</p>
                <p className="text-xs text-gray-500">{Math.round((d.temp_max + d.temp_min) / 2)}°</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Market Price (Agmarknet) ────────────────────────────────────── */}
      {priceData && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
            💰 Market Price — {priceData.crop} (Agmarknet)
          </p>

          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="bg-red-50 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-400">Min Price</p>
              <p className="text-base font-bold text-red-600">₹{priceData.min_price?.toLocaleString("en-IN")}</p>
            </div>
            <div className="bg-green-50 rounded-xl p-3 text-center border-2 border-green-200">
              <p className="text-xs text-gray-400">Modal Price</p>
              <p className="text-base font-bold text-green-700">₹{priceData.modal_price?.toLocaleString("en-IN")}</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-400">Max Price</p>
              <p className="text-base font-bold text-blue-600">₹{priceData.max_price?.toLocaleString("en-IN")}</p>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-gray-400 bg-gray-50 rounded-lg px-3 py-2">
            <span>📍 {priceData.market}</span>
            <span>📅 {priceData.date}</span>
            <span className={`font-medium ${priceData.source?.includes("Fallback") ? "text-amber-500" : "text-green-600"}`}>
              {priceData.source?.includes("Fallback") ? "⚠️ Estimated" : "✅ Live"}
            </span>
          </div>
        </div>
      )}

      {/* ── Data sources footer ─────────────────────────────────────────── */}
      <div className="text-xs text-gray-400 px-1 space-y-0.5">
        <p>🛰️ NDVI & Soil: <a href="https://power.larc.nasa.gov" target="_blank" rel="noreferrer" className="text-blue-400 underline">NASA POWER API</a></p>
        <p>🌦️ Forecast: <a href="https://open-meteo.com" target="_blank" rel="noreferrer" className="text-blue-400 underline">Open-Meteo</a> (IMD-equivalent)</p>
        <p>💰 Prices: <a href="https://data.gov.in" target="_blank" rel="noreferrer" className="text-blue-400 underline">Agmarknet / data.gov.in</a></p>
      </div>
    </div>
  );
}
