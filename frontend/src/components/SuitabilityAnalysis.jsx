// Suitability Analysis — fully dynamic factor breakdown per crop & conditions

const CROP_SOIL_MAP = {
  Rice:["Alluvial","Clay","Loamy"], Maize:["Red","Black","Alluvial"],
  Sugarcane:["Black","Red","Alluvial"], Cotton:["Black","Red"],
  Groundnut:["Red","Black","Alluvial"], Banana:["Alluvial","Red","Loamy"],
  Coconut:["Red","Alluvial","Loamy"], Ragi:["Red","Black"],
  Chilli:["Red","Black","Loamy"], Turmeric:["Red","Black","Loamy"],
  Millets:["Red","Black"], "Black Gram":["Red","Black","Alluvial"],
  "Green Gram":["Red","Black","Loamy"], Sesame:["Red","Black"],
  Sunflower:["Red","Black","Alluvial"], Soybean:["Black","Red"],
};
const CROP_RAIN_MAP = {
  Rice:[100,300], Maize:[50,150], Sugarcane:[150,400], Cotton:[50,120],
  Groundnut:[50,125], Banana:[100,200], Coconut:[130,250], Ragi:[40,100],
  Chilli:[60,120], Turmeric:[150,250], Millets:[25,75], "Black Gram":[60,100],
  "Green Gram":[60,100], Sesame:[50,100], Sunflower:[50,100], Soybean:[75,125],
};
const CROP_TEMP_MAP = {
  Rice:[20,35], Maize:[21,32], Sugarcane:[20,40], Cotton:[21,32],
  Groundnut:[20,30], Banana:[15,35], Coconut:[20,32], Ragi:[15,28],
  Chilli:[20,35], Turmeric:[20,30], Millets:[26,32], "Black Gram":[25,35],
  "Green Gram":[25,35], Sesame:[25,30], Sunflower:[20,25], Soybean:[20,30],
};
const CROP_SEASON_MAP = {
  Rice:["Kharif","Rabi"], Maize:["Kharif","Rabi","Summer"], Sugarcane:["Kharif","Summer"],
  Cotton:["Kharif"], Groundnut:["Kharif","Rabi"], Banana:["Kharif","Summer"],
  Coconut:["Kharif","Summer"], Ragi:["Kharif","Rabi"], Chilli:["Kharif","Rabi"],
  Turmeric:["Kharif"], Millets:["Kharif","Rabi"], "Black Gram":["Kharif","Rabi"],
  "Green Gram":["Kharif","Rabi","Summer"], Sesame:["Kharif","Rabi"],
  Sunflower:["Kharif","Rabi"], Soybean:["Kharif"],
};

function FactorBar({ label, score, icon, detail }) {
  const color = score >= 80 ? "bg-emerald-500" : score >= 55 ? "bg-amber-400" : "bg-red-400";
  const textColor = score >= 80 ? "text-emerald-700" : score >= 55 ? "text-amber-700" : "text-red-600";
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-1 text-gray-600 font-medium">
          <span>{icon}</span>{label}
        </span>
        <span className={`font-bold ${textColor}`}>{Math.round(score)}%</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2">
        <div className={`h-2 rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${Math.min(100, score)}%` }} />
      </div>
      {detail && <p className="text-xs text-gray-400">{detail}</p>}
    </div>
  );
}

export default function SuitabilityAnalysis({ result, formData, t, lang }) {
  if (!result?.top_recommendations?.length) return null;

  const { top_recommendations, current_crop_suitability } = result;
  const bestRec = top_recommendations[0];
  const crop    = formData?.crop || "";
  const soil    = formData?.soil || "";
  const season  = formData?.season || "";
  const rain    = Number(formData?.rainfall ?? 0);
  const temp    = Number(formData?.temperature ?? 30);

  const getCropName = (n) => t.crops?.[n?.toLowerCase().replace(/\s+/g,"")] || n;

  // Build per-factor scores for any crop
  const getFactors = (c) => {
    const soils   = CROP_SOIL_MAP[c]   || [];
    const [rmin, rmax] = CROP_RAIN_MAP[c]   || [50, 200];
    const [tmin, tmax] = CROP_TEMP_MAP[c]   || [20, 35];
    const seasons = CROP_SEASON_MAP[c] || [];

    const soilScore = soils.includes(soil) ? 100 : 20;
    let rainScore = 100;
    if (rain < rmin) rainScore = Math.max(0, 100 - (rmin - rain) * 1.2);
    else if (rain > rmax) rainScore = Math.max(0, 100 - (rain - rmax) * 0.8);
    let tempScore = 100;
    if (temp < tmin) tempScore = Math.max(0, 100 - (tmin - temp) * 8);
    else if (temp > tmax) tempScore = Math.max(0, 100 - (temp - tmax) * 8);
    const seasonScore = seasons.includes(season) ? 100 : 0;

    return {
      soil:   { score: soilScore,   detail: soils.includes(soil) ? `${soil} soil is ideal for ${c}` : `${soil} soil is not optimal — ${soils[0]} preferred` },
      rain:   { score: rainScore,   detail: rain >= rmin && rain <= rmax ? `${rain}mm is within optimal range (${rmin}–${rmax}mm)` : rain < rmin ? `${rain}mm is below optimal (${rmin}mm min)` : `${rain}mm exceeds optimal (${rmax}mm max)` },
      temp:   { score: tempScore,   detail: temp >= tmin && temp <= tmax ? `${temp}°C is in ideal range (${tmin}–${tmax}°C)` : temp < tmin ? `${temp}°C is below optimal (${tmin}°C min)` : `${temp}°C exceeds optimal (${tmax}°C max)` },
      season: { score: seasonScore, detail: seasons.includes(season) ? `${season} is a suitable season for ${c}` : `${season} is not ideal — best in ${seasons.join(" / ")}` },
    };
  };

  const bestFactors    = getFactors(bestRec.crop);
  const currentFactors = crop ? getFactors(crop) : null;
  const isSameCrop     = crop === bestRec.crop;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-emerald-500 px-5 py-3">
        <h3 className="text-white font-bold text-base">🔍 Suitability Analysis</h3>
        <p className="text-teal-100 text-xs mt-0.5">Environmental factor breakdown for your conditions</p>
      </div>

      <div className="p-5 space-y-5">

        {/* Best recommendation factors */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-gray-700">
              {isSameCrop ? `✅ Your Crop — ${getCropName(bestRec.crop)}` : `🎯 Best Match — ${getCropName(bestRec.crop)}`}
            </p>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              bestRec.suitability_score >= 80 ? "bg-emerald-100 text-emerald-700" :
              bestRec.suitability_score >= 55 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-600"
            }`}>{bestRec.suitability_score}% match</span>
          </div>
          <div className="space-y-3">
            <FactorBar label="Soil Compatibility" icon="🪨" score={bestFactors.soil.score}   detail={bestFactors.soil.detail}   />
            <FactorBar label="Rainfall Match"     icon="🌧️" score={bestFactors.rain.score}   detail={bestFactors.rain.detail}   />
            <FactorBar label="Temperature Match"  icon="🌡️" score={bestFactors.temp.score}   detail={bestFactors.temp.detail}   />
            <FactorBar label="Season Suitability" icon="📅" score={bestFactors.season.score} detail={bestFactors.season.detail} />
          </div>
          <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
            <div className="bg-green-50 rounded-lg p-2">
              <span className="text-gray-500">Est. Yield:</span>
              <span className="font-bold text-green-700 ml-1">{bestRec.predicted_yield} T/Ha</span>
            </div>
            <div className="bg-blue-50 rounded-lg p-2">
              <span className="text-gray-500">Market:</span>
              <span className="font-bold text-blue-700 ml-1">₹{bestRec.market_price}/qtl</span>
            </div>
          </div>
        </div>

        {/* Current crop comparison — only if different */}
        {!isSameCrop && currentFactors && current_crop_suitability?.suitability !== undefined && (
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-gray-700">
                📋 Your Crop — {getCropName(crop)}
              </p>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                current_crop_suitability.suitability >= 80 ? "bg-emerald-100 text-emerald-700" :
                current_crop_suitability.suitability >= 55 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-600"
              }`}>{current_crop_suitability.suitability}% match</span>
            </div>
            <div className="space-y-3">
              <FactorBar label="Soil Compatibility" icon="🪨" score={currentFactors.soil.score}   detail={currentFactors.soil.detail}   />
              <FactorBar label="Rainfall Match"     icon="🌧️" score={currentFactors.rain.score}   detail={currentFactors.rain.detail}   />
              <FactorBar label="Temperature Match"  icon="🌡️" score={currentFactors.temp.score}   detail={currentFactors.temp.detail}   />
              <FactorBar label="Season Suitability" icon="📅" score={currentFactors.season.score} detail={currentFactors.season.detail} />
            </div>

            {/* Comparison callout */}
            {current_crop_suitability.suitability < bestRec.suitability_score && (
              <div className="mt-3 bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800">
                💡 Switching to <strong>{getCropName(bestRec.crop)}</strong> could improve suitability by{" "}
                <strong>{(bestRec.suitability_score - current_crop_suitability.suitability).toFixed(1)}%</strong> and yield by{" "}
                <strong>{Math.max(0, bestRec.predicted_yield - (current_crop_suitability.predicted_yield || 0)).toFixed(1)} T/Ha</strong>
              </div>
            )}
          </div>
        )}

        {/* All 3 recommendations mini-comparison */}
        {top_recommendations.length > 1 && (
          <div className="border-t pt-4">
            <p className="text-xs font-semibold text-gray-500 mb-2">COMPARISON — TOP 3</p>
            <div className="space-y-2">
              {top_recommendations.map((rec, i) => (
                <div key={rec.crop} className={`flex items-center gap-3 p-2.5 rounded-xl ${
                  rec.crop === crop ? "bg-emerald-50 border border-emerald-200" :
                  i === 0 ? "bg-green-50 border border-green-100" : "bg-gray-50 border border-gray-100"
                }`}>
                  <span className="text-xs font-bold text-gray-400 w-4">#{i+1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-semibold text-gray-700 truncate">{getCropName(rec.crop)}</span>
                      {rec.crop === crop && <span className="text-xs bg-emerald-200 text-emerald-800 px-1.5 rounded-full shrink-0">You</span>}
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                      <div className="bg-green-500 h-1.5 rounded-full" style={{ width:`${rec.suitability_score}%` }} />
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-bold text-gray-700">{rec.suitability_score}%</p>
                    <p className="text-xs text-gray-400">{rec.predicted_yield} T/Ha</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
