import { useEffect, useState, useCallback } from "react";
import { api } from "../api";
import WeatherWidget from "../components/WeatherWidget";
import PredictionCard from "../components/PredictionCard";
import SuitabilityAnalysis from "../components/SuitabilityAnalysis";
import ExternalDataWidget from "../components/ExternalDataWidget";
import { MobileLoadingSpinner } from "../components/MobileOptimized";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, ReferenceLine
} from "recharts";
import { TN_DISTRICTS } from "../data/districts";

// ── Crop-specific 5-year historical baselines ─────────────────────────────────
const CROP_HISTORY = {
  "Rice":       [3.1,3.4,3.2,3.6,3.8], "Maize":      [2.6,2.9,2.7,3.1,3.0],
  "Sugarcane":  [5.5,6.0,5.8,6.3,6.5], "Cotton":     [1.4,1.6,1.5,1.7,1.8],
  "Groundnut":  [1.7,1.9,1.8,2.0,2.1], "Banana":     [3.8,4.2,4.0,4.4,4.5],
  "Coconut":    [3.0,3.3,3.1,3.5,3.6], "Ragi":       [1.6,1.8,1.7,1.9,2.0],
  "Chilli":     [2.5,2.8,2.6,3.0,3.1], "Turmeric":   [3.8,4.2,4.0,4.5,4.6],
  "Millets":    [1.1,1.3,1.2,1.4,1.5], "Black Gram": [0.9,1.0,0.95,1.1,1.1],
  "Green Gram": [0.7,0.8,0.75,0.9,0.9],"Sesame":     [0.5,0.6,0.55,0.65,0.7],
  "Sunflower":  [1.1,1.2,1.15,1.3,1.4],"Soybean":    [1.5,1.7,1.6,1.8,1.9],
};

const CROPS = [
  "Rice","Maize","Sugarcane","Cotton","Groundnut","Banana",
  "Coconut","Ragi","Chilli","Turmeric","Millets","Black Gram",
  "Green Gram","Sesame","Sunflower","Soybean"
];
const SEASONS   = ["Kharif","Rabi","Summer"];
const SOIL_TYPES= ["Red","Black","Alluvial","Clay","Loamy"];

// ── Reusable styled select/input ──────────────────────────────────────────────
function Field({ label, children }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</label>
      {children}
    </div>
  );
}
const selectCls = "w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent appearance-none cursor-pointer";
const inputCls  = "w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent";

// ── Custom chart tooltip ──────────────────────────────────────────────────────
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const isAI = label === "2025 AI";
  return (
    <div className={`px-3 py-2 rounded-xl shadow-lg text-xs border ${isAI ? "bg-green-600 text-white border-green-500" : "bg-white text-gray-700 border-gray-100"}`}>
      <p className="font-bold">{label}</p>
      <p>{payload[0].value} T/Ha {isAI ? "🤖" : ""}</p>
    </div>
  );
}

export default function Predict({ t = {}, lang = "en", isMobile, weather: propWeather }) {
  const [form, setForm] = useState({
    crop: "Rice", season: "Kharif", soil: "Red",
    area: 1, district: "Coimbatore"
  });
  const [weather, setWeather] = useState(propWeather || null);
  const [result,  setResult]  = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  // Sync weather from parent
  useEffect(() => {
    if (propWeather) setWeather(propWeather);
  }, [propWeather]);

  // Auto-fetch weather if not provided
  useEffect(() => {
    if (weather) return;
    navigator.geolocation?.getCurrentPosition(
      async ({ coords: { latitude: lat, longitude: lon } }) => {
        const key = import.meta.env.VITE_OPENWEATHER_KEY;
        if (!key) { setWeather({ temperature: 30, rainfall: 0 }); return; }
        try {
          const r = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${key}&units=metric`);
          const d = await r.json();
          setWeather({
            temperature: Math.round(d?.main?.temp ?? 30),
            rainfall:    d?.rain ? Math.round(d.rain["1h"] || 0) : 0,
            humidity:    d?.main?.humidity,
            description: d?.weather?.[0]?.description
          });
          setForm(f => ({ ...f, district: d?.name || f.district }));
        } catch { setWeather({ temperature: 30, rainfall: 0 }); }
      },
      () => setWeather({ temperature: 30, rainfall: 0 })
    );
  }, [weather]);

  const handlePredict = useCallback(async () => {
    setResult(null); setLoading(true); setError(null);
    try {
      const res = await api.post("/predict", {
        district:    form.district,
        crop:        form.crop,
        season:      form.season,
        soil:        form.soil,
        area:        Number(form.area) || 1,
        rainfall:    Number(weather?.rainfall    ?? 0),
        temperature: Number(weather?.temperature ?? 30),
      });
      setResult(res.data);
      // Save to history
      const item = {
        ...res.data, ...form,
        rainfall:    Number(weather?.rainfall    ?? 0),
        temperature: Number(weather?.temperature ?? 30),
        timestamp:   new Date().toISOString()
      };
      const hist = JSON.parse(localStorage.getItem("cropPredictions") || "[]");
      localStorage.setItem("cropPredictions", JSON.stringify([item, ...hist].slice(0, 50)));
    } catch {
      setError("Failed to get prediction. Check backend connection and try again.");
    } finally {
      setLoading(false);
    }
  }, [form, weather]);

  // Chart data — crop-specific historical + AI prediction
  const cropHist   = CROP_HISTORY[form.crop] || [2.8, 3.0, 2.9, 3.2, 3.3];
  const avgYield   = (cropHist.reduce((a, b) => a + b, 0) / cropHist.length).toFixed(1);
  const chartData  = ["2020","2021","2022","2023","2024"].map((y, i) => ({
    name: y, yield: cropHist[i], type: "historical"
  }));
  if (result) chartData.push({ name: "2025 AI", yield: result.predicted_yield_tph, type: "ai" });

  const formData = {
    ...form,
    rainfall:    Number(weather?.rainfall    ?? 0),
    temperature: Number(weather?.temperature ?? 30),
  };

  return (
    <div className={`space-y-4 ${isMobile ? "px-0 pb-4" : "p-4 max-w-2xl mx-auto"}`}>

      {/* ── Page header ──────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-500 text-white px-5 py-4 rounded-2xl shadow-md mx-3">
        <h2 className="text-lg font-bold">🌾 {t.predictTitle || "Crop Yield Prediction"}</h2>
        <p className="text-green-100 text-xs mt-0.5">
          {lang === "ta" ? "நேரடி ML பயிர் முடிவு ஆதரவு அமைப்பு" : "Real-time ML · District · Soil · Season · Weather"}
        </p>
        <div className="flex gap-2 mt-2 flex-wrap">
          {["ML Model","Weather","16 Crops","38 Districts"].map(tag => (
            <span key={tag} className="bg-white/20 text-white text-xs px-2.5 py-0.5 rounded-full">{tag}</span>
          ))}
        </div>
      </div>

      {/* ── Weather widget ────────────────────────────────────────────────── */}
      <div className="mx-3">
        <WeatherWidget weather={weather} t={t} lang={lang} />
      </div>

      {/* ── Input form ───────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mx-3 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-50 flex items-center gap-2">
          <span className="text-base">📋</span>
          <h3 className="font-semibold text-gray-800 text-sm">{t.inputForm || "Farm Parameters"}</h3>
        </div>

        <div className="px-5 py-4 space-y-4">
          {/* Crop — full width, prominent */}
          <Field label={t.crop || "Crop"}>
            <div className="relative">
              <select className={selectCls} value={form.crop} onChange={set("crop")}>
                {CROPS.map(c => (
                  <option key={c} value={c}>
                    {t.crops?.[c.toLowerCase().replace(/\s+/g,"")] || c}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">▾</div>
            </div>
          </Field>

          {/* Season + Soil */}
          <div className="grid grid-cols-2 gap-3">
            <Field label={t.season || "Season"}>
              <div className="relative">
                <select className={selectCls} value={form.season} onChange={set("season")}>
                  {SEASONS.map(s => (
                    <option key={s} value={s}>{t.seasons?.[s.toLowerCase()] || s}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">▾</div>
              </div>
            </Field>
            <Field label={t.soil || "Soil Type"}>
              <div className="relative">
                <select className={selectCls} value={form.soil} onChange={set("soil")}>
                  {SOIL_TYPES.map(s => (
                    <option key={s} value={s}>{t.soilTypes?.[s.toLowerCase()] || s}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">▾</div>
              </div>
            </Field>
          </div>

          {/* Area + District */}
          <div className="grid grid-cols-2 gap-3">
            <Field label={t.area || "Area (Ha)"}>
              <input
                type="number" min="0.1" step="0.1"
                className={inputCls}
                value={form.area}
                onChange={set("area")}
                placeholder="1.0"
              />
            </Field>
            <Field label={t.district || "District"}>
              <div className="relative">
                <select className={selectCls} value={form.district} onChange={set("district")}>
                  {TN_DISTRICTS.map(d => (
                    <option key={d} value={d}>{t.districts?.[d.toLowerCase()] || d}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">▾</div>
              </div>
            </Field>
          </div>

          {/* Weather strip */}
          {weather && (
            <div className="flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-2.5 text-xs text-blue-700">
              <span>🌤️</span>
              <span>Live weather: <strong>{weather.temperature}°C</strong> · <strong>{weather.rainfall}mm</strong> rainfall — used for prediction</span>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
              <span className="shrink-0">❌</span>
              <span>{error}</span>
            </div>
          )}

          {/* Predict button */}
          <button
            onClick={handlePredict}
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-500 text-white rounded-xl py-3.5 font-bold text-sm shadow-md hover:shadow-lg active:scale-95 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                {t.predicting || "Analyzing…"}
              </>
            ) : (
              <>🤖 {t.predictBtn || "Predict Yield"}</>
            )}
          </button>
        </div>
      </div>

      {/* ── Loading ───────────────────────────────────────────────────────── */}
      {loading && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mx-3">
          <MobileLoadingSpinner message="Analyzing crop conditions with AI…" />
        </div>
      )}

      {/* ── Results ───────────────────────────────────────────────────────── */}
      {result && (
        <>
          {/* Prediction card */}
          <div className="mx-3">
            <PredictionCard result={result} t={t} lang={lang} formData={formData} />
          </div>

          {/* Yield trend chart */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mx-3 overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-50">
              <h3 className="font-semibold text-gray-800 text-sm">📊 Yield Trend — {form.crop}</h3>
              <p className="text-xs text-gray-400 mt-0.5">Historical vs AI predicted · avg {avgYield} T/Ha</p>
            </div>
            <div className="px-4 pt-3 pb-4">
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top:4, right:4, left:-20, bottom:0 }}>
                    <defs>
                      <linearGradient id="yieldGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#16a34a" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#16a34a" stopOpacity={0}    />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize:11, fill:"#9ca3af" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize:11, fill:"#9ca3af" }} axisLine={false} tickLine={false} />
                    <Tooltip content={<ChartTooltip />} />
                    <ReferenceLine
                      y={Number(avgYield)}
                      stroke="#94a3b8"
                      strokeDasharray="4 3"
                      label={{ value:`Avg ${avgYield}`, position:"insideTopRight", fontSize:10, fill:"#94a3b8" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="yield"
                      stroke="#16a34a"
                      strokeWidth={2.5}
                      fill="url(#yieldGrad)"
                      dot={(props) => {
                        const isAI = props.payload?.name === "2025 AI";
                        return (
                          <circle
                            key={props.key}
                            cx={props.cx} cy={props.cy} r={isAI ? 6 : 4}
                            fill={isAI ? "#16a34a" : "#fff"}
                            stroke="#16a34a" strokeWidth={2}
                          />
                        );
                      }}
                      activeDot={{ r:7, fill:"#16a34a" }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Chart summary row */}
              <div className="grid grid-cols-3 gap-2 mt-3">
                <div className="bg-green-50 rounded-xl p-3 text-center">
                  <p className="text-xs text-gray-400">AI Prediction</p>
                  <p className="text-base font-bold text-green-700">{result.predicted_yield_tph} T/Ha</p>
                </div>
                <div className="bg-blue-50 rounded-xl p-3 text-center">
                  <p className="text-xs text-gray-400">5yr Average</p>
                  <p className="text-base font-bold text-blue-700">{avgYield} T/Ha</p>
                </div>
                <div className="bg-purple-50 rounded-xl p-3 text-center">
                  <p className="text-xs text-gray-400">Est. Revenue</p>
                  <p className="text-base font-bold text-purple-700">
                    ₹{Math.round(result.predicted_yield_tph * form.area * (result.market_price_inr_per_quintal / 10)).toLocaleString("en-IN")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Suitability analysis */}
          <div className="mx-3">
            <SuitabilityAnalysis result={result} t={t} lang={lang} formData={formData} />
          </div>

          {/* Live satellite & market data */}
          <div className="mx-3">
            <ExternalDataWidget district={form.district} crop={form.crop} />
          </div>
        </>
      )}
    </div>
  );
}
