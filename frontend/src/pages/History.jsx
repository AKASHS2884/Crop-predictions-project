import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { MobileCard, MobileButton } from "../components/MobileOptimized";

const CROP_BENCHMARKS = {
  Rice:3.5, Maize:3.0, Sugarcane:6.0, Cotton:1.8, Groundnut:2.0,
  Banana:4.5, Coconut:3.5, Ragi:2.0, Chilli:3.0, Turmeric:4.5,
  Millets:1.5, "Black Gram":1.1, "Green Gram":0.9, Sesame:0.7,
  Sunflower:1.4, Soybean:1.8
};

export default function History({ t, lang, isMobile }) {
  const [predictions, setPredictions] = useState([]);
  const [expanded, setExpanded]       = useState(null);
  const [filter, setFilter]           = useState("all");

  useEffect(() => {
    const saved = localStorage.getItem("cropPredictions");
    if (saved) setPredictions(JSON.parse(saved));
  }, []);

  const clearHistory = () => {
    if (!window.confirm("Clear all prediction history?")) return;
    localStorage.removeItem("cropPredictions");
    setPredictions([]);
  };

  const exportHistory = () => {
    const blob = new Blob([JSON.stringify(predictions, null, 2)], { type:"application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `crop_history_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
  };

  const fmt = (d) => new Date(d).toLocaleDateString("en-IN", {
    day:"numeric", month:"short", year:"numeric",
    hour:"2-digit", minute:"2-digit"
  });

  // Per-crop risk relative to benchmark
  const getRisk = (p) => {
    const bench = CROP_BENCHMARKS[p.crop] ?? 3.0;
    const ratio = (p.predicted_yield_tph || 0) / bench;
    if (ratio >= 0.9) return { label:"Good",    cls:"bg-emerald-100 text-emerald-700" };
    if (ratio >= 0.65) return { label:"Average", cls:"bg-amber-100 text-amber-700"   };
    return               { label:"Low",     cls:"bg-red-100 text-red-600"       };
  };

  // Summary stats
  const total   = predictions.length;
  const avgYield = total ? (predictions.reduce((s,p) => s+(p.predicted_yield_tph||0),0)/total).toFixed(2) : 0;
  const crops   = [...new Set(predictions.map(p=>p.crop))];

  // Chart data — last 10 predictions
  const chartData = predictions.slice(0,10).reverse().map((p,i) => ({
    name: `#${i+1}`,
    yield: p.predicted_yield_tph,
    crop: p.crop,
  }));

  // Filter
  const filtered = filter === "all" ? predictions
    : predictions.filter(p => p.crop === filter);

  const content = (
    <div className="space-y-4 px-3 pb-6">

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-500 rounded-2xl p-4 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold">Prediction History</h2>
            <p className="text-blue-100 text-xs mt-0.5">{total} records saved locally</p>
          </div>
          {total > 0 && (
            <div className="flex gap-2">
              <button onClick={exportHistory}
                className="bg-white/20 hover:bg-white/30 text-white text-xs px-3 py-1.5 rounded-lg font-medium active:scale-95">
                📤 Export
              </button>
              <button onClick={clearHistory}
                className="bg-red-500/80 hover:bg-red-500 text-white text-xs px-3 py-1.5 rounded-lg font-medium active:scale-95">
                🗑️ Clear
              </button>
            </div>
          )}
        </div>

        {/* Summary stats */}
        {total > 0 && (
          <div className="grid grid-cols-3 gap-2 mt-3">
            {[
              { label:"Predictions", value: total },
              { label:"Avg Yield",   value: `${avgYield} T/Ha` },
              { label:"Crops Tried", value: crops.length },
            ].map(s => (
              <div key={s.label} className="bg-white/15 rounded-xl p-2 text-center">
                <p className="text-base font-bold">{s.value}</p>
                <p className="text-xs text-blue-100">{s.label}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {total === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center border border-gray-100 shadow-sm">
          <div className="text-5xl mb-3">📊</div>
          <p className="font-semibold text-gray-700">No predictions yet</p>
          <p className="text-sm text-gray-400 mt-1">Make your first prediction to see history here</p>
        </div>
      ) : (
        <>
          {/* Yield trend chart */}
          {chartData.length > 1 && (
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
              <p className="text-sm font-semibold text-gray-700 mb-3">📈 Yield Trend (Last {chartData.length})</p>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize:10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize:10 }} axisLine={false} tickLine={false} width={30} />
                    <Tooltip
                      formatter={(v, _, p) => [`${v} T/Ha`, p.payload.crop]}
                      contentStyle={{ borderRadius:8, border:"none", boxShadow:"0 4px 12px rgba(0,0,0,0.1)", fontSize:12 }}
                    />
                    <Line type="monotone" dataKey="yield" stroke="#16a34a" strokeWidth={2.5}
                      dot={{ r:4, fill:"#16a34a" }} activeDot={{ r:6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Crop filter */}
          {crops.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              <button onClick={() => setFilter("all")}
                className={`shrink-0 text-xs px-3 py-1.5 rounded-full font-medium transition-all ${
                  filter==="all" ? "bg-green-600 text-white" : "bg-white border border-gray-200 text-gray-600"}`}>
                All
              </button>
              {crops.map(c => (
                <button key={c} onClick={() => setFilter(c)}
                  className={`shrink-0 text-xs px-3 py-1.5 rounded-full font-medium transition-all ${
                    filter===c ? "bg-green-600 text-white" : "bg-white border border-gray-200 text-gray-600"}`}>
                  {c}
                </button>
              ))}
            </div>
          )}

          {/* Prediction cards */}
          <div className="space-y-3">
            {filtered.map((p, i) => {
              const risk = getRisk(p);
              const isOpen = expanded === i;
              return (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-gray-800">{p.crop}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${risk.cls}`}>
                            {risk.label}
                          </span>
                          {p.recommended_crop && p.recommended_crop !== p.crop && (
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                              → {p.recommended_crop}
                            </span>
                          )}
                          {p.recommended_crop === p.crop && (
                            <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                              ✅ Optimal
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mt-1">{p.district} · {p.season} · {fmt(p.timestamp)}</p>
                      </div>
                      <div className="text-right shrink-0 ml-3">
                        <p className="text-lg font-bold text-green-600">{p.predicted_yield_tph}</p>
                        <p className="text-xs text-gray-400">T/Ha</p>
                      </div>
                    </div>

                    {/* Quick metrics */}
                    <div className="grid grid-cols-3 gap-2 mt-3">
                      <div className="bg-gray-50 rounded-lg p-2 text-center">
                        <p className="text-xs text-gray-400">Temp</p>
                        <p className="text-sm font-semibold">{p.temperature}°C</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-2 text-center">
                        <p className="text-xs text-gray-400">Rain</p>
                        <p className="text-sm font-semibold">{p.rainfall}mm</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-2 text-center">
                        <p className="text-xs text-gray-400">Soil</p>
                        <p className="text-sm font-semibold truncate">{p.soil}</p>
                      </div>
                    </div>

                    <button onClick={() => setExpanded(isOpen ? null : i)}
                      className="mt-3 w-full text-xs text-gray-400 flex items-center justify-center gap-1">
                      {isOpen ? "▲ Less details" : "▼ More details"}
                    </button>
                  </div>

                  {/* Expanded details */}
                  {isOpen && (
                    <div className="border-t border-gray-100 px-4 py-3 bg-gray-50">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div><span className="text-gray-400 text-xs">Area</span><p className="font-medium">{p.area} Ha</p></div>
                        <div><span className="text-gray-400 text-xs">Market Price</span><p className="font-medium">₹{p.market_price_inr_per_quintal}/qtl</p></div>
                        {p.current_crop_suitability?.suitability !== undefined && (
                          <div><span className="text-gray-400 text-xs">Suitability</span><p className="font-medium">{p.current_crop_suitability.suitability}%</p></div>
                        )}
                        {p.current_crop_suitability?.combined_score !== undefined && (
                          <div><span className="text-gray-400 text-xs">Score</span><p className="font-medium">{p.current_crop_suitability.combined_score}/100</p></div>
                        )}
                      </div>
                      {/* Top recommendations if saved */}
                      {p.top_recommendations?.length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs text-gray-400 mb-1">Top Recommendations</p>
                          <div className="flex gap-2 flex-wrap">
                            {p.top_recommendations.map((r,ri) => (
                              <span key={ri} className="text-xs bg-white border border-gray-200 px-2 py-1 rounded-lg">
                                #{ri+1} {r.crop} ({r.suitability_score}%)
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );

  return isMobile ? content : (
    <div className="max-w-3xl mx-auto pt-4">{content}</div>
  );
}
