import jsPDF from "jspdf";

// Per-crop expected yield ranges for contextual risk assessment
const CROP_YIELD_BENCHMARKS = {
  "Rice":3.5,"Maize":3.0,"Sugarcane":6.0,"Cotton":1.8,"Groundnut":2.0,
  "Banana":4.5,"Coconut":3.5,"Ragi":2.0,"Chilli":3.0,"Turmeric":4.5,
  "Millets":1.5,"Black Gram":1.1,"Green Gram":0.9,"Sesame":0.7,
  "Sunflower":1.4,"Soybean":1.8
};

// Per-crop optimal rainfall for NDVI/moisture estimation
const CROP_OPTIMAL_RAIN = {
  "Rice":200,"Maize":100,"Sugarcane":260,"Cotton":85,"Groundnut":87,
  "Banana":150,"Coconut":190,"Ragi":70,"Chilli":90,"Turmeric":200,
  "Millets":50,"Black Gram":80,"Green Gram":80,"Sesame":75,
  "Sunflower":75,"Soybean":100
};

export default function PredictionCard({ result, t = {}, lang = "en", formData = {} }) {
  if (!result) return null;

  const { top_recommendations = [], current_crop_suitability = {}, input_summary = {} } = result;
  const inp = { ...input_summary, ...formData };

  const tph        = result.predicted_yield_tph;
  const price      = result.market_price_inr_per_quintal;
  const crop       = inp.crop || "Rice";
  const rainfall   = Number(inp.rainfall  ?? 0);
  const temperature= Number(inp.temperature ?? 30);
  const area       = Number(inp.area ?? 1);
  const suitability= current_crop_suitability?.suitability ?? 0;

  const getCropName = (name) => t.crops?.[name?.toLowerCase().replace(/\s+/g,"")] || name;

  // ── 1. RISK: relative to crop's own benchmark, not a fixed number ──────────
  const benchmark = CROP_YIELD_BENCHMARKS[crop] ?? 3.0;
  const yieldRatio = tph / benchmark;  // 1.0 = exactly average for this crop
  const riskLevel  = yieldRatio >= 0.9 ? "low" : yieldRatio >= 0.65 ? "medium" : "high";
  const riskMeta   = {
    low:    { label:"Good Yield",    color:"text-emerald-700", bg:"bg-emerald-50", border:"border-emerald-200", dot:"bg-emerald-500", bar:"bg-emerald-500" },
    medium: { label:"Average Yield", color:"text-amber-700",   bg:"bg-amber-50",   border:"border-amber-200",   dot:"bg-amber-500",   bar:"bg-amber-500"   },
    high:   { label:"Below Average", color:"text-red-700",     bg:"bg-red-50",     border:"border-red-200",     dot:"bg-red-500",     bar:"bg-red-500"     },
  };
  const risk = riskMeta[riskLevel];

  // ── 2. CONFIDENCE: based on suitability score from backend ─────────────────
  const confidence = Math.round(40 + suitability * 0.58);  // 40–98%

  // ── 3. NDVI: based on actual rainfall vs crop's optimal ────────────────────
  const optRain  = CROP_OPTIMAL_RAIN[crop] ?? 100;
  const rainRatio= Math.min(1, rainfall / optRain);
  const ndvi     = (0.3 + rainRatio * 0.55 + (yieldRatio * 0.1)).toFixed(2);

  // ── 4. SOIL MOISTURE: rainfall + temperature driven ────────────────────────
  const tempFactor   = Math.max(0, 1 - (temperature - 25) / 30);
  const soilMoisture = Math.round(Math.min(95, rainRatio * 60 + tempFactor * 25 + 10));

  // ── 5. PROFITABILITY: yield × market price vs crop average ─────────────────
  const revenue        = tph * area * (price / 10);
  const avgRevenue     = benchmark * area * (price / 10);
  const profitRatio    = revenue / avgRevenue;
  const profitability  = profitRatio >= 1.0 ? "High" : profitRatio >= 0.7 ? "Moderate" : "Low";
  const profitColor    = profitRatio >= 1.0 ? "text-emerald-600" : profitRatio >= 0.7 ? "text-amber-600" : "text-red-600";
  const estimatedRevenue = Math.round(revenue).toLocaleString("en-IN");

  // ── 6. DYNAMIC AI INSIGHTS: fully context-driven ───────────────────────────
  const isCurrentBest = result.recommended_crop === crop;
  const bestRec       = top_recommendations[0];
  // yieldGap only meaningful if best rec is a DIFFERENT crop
  const yieldGap = (bestRec && bestRec.crop !== crop)
    ? Math.max(0, bestRec.predicted_yield - tph).toFixed(1)
    : 0;

  const insights = [];

  // ── Crop performance insight ──
  // If current crop IS the recommended one, never show a "switch" message
  if (isCurrentBest) {
    if (yieldRatio >= 0.9) {
      insights.push({ icon:"✅", text:`${crop} is the best crop for your conditions and is yielding above its average benchmark (${benchmark} T/Ha). Great choice!`, type:"success" });
    } else if (yieldRatio >= 0.65) {
      insights.push({ icon:"✅", text:`${crop} is the recommended crop for your conditions. Yield is slightly below peak — soil preparation and irrigation can improve output.`, type:"success" });
    } else {
      insights.push({ icon:"⚠️", text:`${crop} is recommended for your conditions, but yield is below typical range. Consider soil testing and balanced fertilization to improve performance.`, type:"warning" });
    }
  } else {
    // Current crop is NOT the best — give actionable advice
    if (yieldRatio >= 1.0) {
      insights.push({ icon:"✅", text:`${crop} is performing above its benchmark (${benchmark} T/Ha). However, ${result.recommended_crop} may offer even better returns for your conditions.`, type:"success" });
    } else if (yieldRatio >= 0.65) {
      insights.push({ icon:"⚠️", text:`${crop} yield is slightly below its typical range. Consider switching to ${result.recommended_crop} for better results in your current conditions.`, type:"warning" });
    } else {
      insights.push({ icon:"❌", text:`${crop} is not well-suited for current conditions. Switching to ${result.recommended_crop} could improve yield by ${yieldGap} T/Ha.`, type:"error" });
    }
  }

  // Rainfall insight
  if (rainfall === 0) {
    insights.push({ icon:"💧", text:`No rainfall recorded. Supplemental irrigation is critical — schedule every 3-4 days for ${crop}.`, type:"warning" });
  } else if (rainfall < optRain * 0.5) {
    insights.push({ icon:"🌧️", text:`Rainfall (${rainfall}mm) is below optimal (${optRain}mm) for ${crop}. Increase irrigation frequency.`, type:"warning" });
  } else if (rainfall > optRain * 1.5) {
    insights.push({ icon:"🌊", text:`Excess rainfall (${rainfall}mm) detected. Ensure proper drainage to prevent waterlogging for ${crop}.`, type:"warning" });
  } else {
    insights.push({ icon:"🌧️", text:`Rainfall (${rainfall}mm) is within optimal range for ${crop}. Maintain current irrigation schedule.`, type:"success" });
  }

  // Temperature insight
  if (temperature > 38) {
    insights.push({ icon:"🌡️", text:`High temperature (${temperature}°C) may cause heat stress. Consider mulching and evening irrigation.`, type:"error" });
  } else if (temperature < 20) {
    insights.push({ icon:"❄️", text:`Low temperature (${temperature}°C) may slow crop growth. Protect seedlings from cold stress.`, type:"warning" });
  } else {
    insights.push({ icon:"🌡️", text:`Temperature (${temperature}°C) is suitable for ${crop} cultivation.`, type:"success" });
  }

  // ── Recommendation insight ──
  if (isCurrentBest) {
    insights.push({ icon:"🏆", text:`${crop} is the optimal crop for your current conditions. You've made the best choice!`, type:"success" });
  } else if (bestRec && bestRec.crop !== crop && Number(yieldGap) > 0.3) {
    insights.push({ icon:"🎯", text:`Switching to ${bestRec.crop} could yield ${yieldGap} T/Ha more at ₹${bestRec.market_price}/qtl market price.`, type:"info" });
  }

  // Suitability insight
  if (suitability >= 80) {
    insights.push({ icon:"🌱", text:`Soil, season, and district conditions are highly compatible with ${crop} (${suitability}% suitability).`, type:"success" });
  } else if (suitability >= 55) {
    insights.push({ icon:"🌱", text:`Moderate environmental suitability (${suitability}%). Soil amendments may improve compatibility.`, type:"warning" });
  } else {
    insights.push({ icon:"🌱", text:`Low suitability (${suitability}%) for ${crop} in current conditions. Review soil type and season selection.`, type:"error" });
  }

  const insightColors = {
    success: "bg-emerald-50 border-emerald-200 text-emerald-800",
    warning: "bg-amber-50 border-amber-200 text-amber-800",
    error:   "bg-red-50 border-red-200 text-red-800",
    info:    "bg-blue-50 border-blue-200 text-blue-800",
  };

  // ── PDF ────────────────────────────────────────────────────────────────────
  const downloadReport = () => {
    const doc = new jsPDF({ unit:"mm", format:"a4" });
    const W = 210, M = 15;
    let y = 0;
    const addPage = () => { doc.addPage(); y = 20; };
    const checkY  = (n=12) => { if (y+n > 275) addPage(); };

    doc.setFillColor(22,163,74); doc.rect(0,0,W,38,"F");
    doc.setFillColor(5,150,105); doc.rect(0,28,W,10,"F");
    doc.setTextColor(255,255,255);
    doc.setFontSize(20); doc.setFont("helvetica","bold");
    doc.text("SMART CROP ADVISOR", M, 14);
    doc.setFontSize(10); doc.setFont("helvetica","normal");
    doc.text("AI-Powered Crop Yield Prediction Report", M, 22);
    doc.setFontSize(8);
    doc.text(`Generated: ${new Date().toLocaleString("en-IN")}  |  Tamil Nadu Agricultural DSS  |  v2.1`, M, 33);
    y = 48;

    const secTitle = (title) => {
      checkY(14);
      doc.setFillColor(240,253,244); doc.rect(M,y-5,W-M*2,10,"F");
      doc.setDrawColor(22,163,74); doc.setLineWidth(0.5); doc.line(M,y-5,M,y+5);
      doc.setTextColor(22,163,74); doc.setFontSize(11); doc.setFont("helvetica","bold");
      doc.text(title, M+3, y+1); doc.setTextColor(50,50,50); y+=10;
    };
    const row = (label, value, bold=false) => {
      checkY(8); doc.setFontSize(9);
      doc.setFont("helvetica","normal"); doc.setTextColor(100,100,100);
      doc.text(label, M, y);
      doc.setFont("helvetica", bold?"bold":"normal"); doc.setTextColor(30,30,30);
      doc.text(String(value), M+70, y); y+=7;
    };
    const divider = () => { checkY(6); doc.setDrawColor(220,220,220); doc.setLineWidth(0.3); doc.line(M,y,W-M,y); y+=5; };

    secTitle("1. FARM INPUT PARAMETERS");
    row("District",    inp.district||"—");
    row("Crop",        crop);
    row("Season",      inp.season||"—");
    row("Soil Type",   inp.soil||"—");
    row("Farm Area",   `${area} Hectares`);
    row("Rainfall",    `${rainfall} mm`);
    row("Temperature", `${temperature} °C`);
    divider();

    secTitle("2. PREDICTION RESULTS");
    doc.setFillColor(22,163,74); doc.roundedRect(M,y,W-M*2,22,3,3,"F");
    doc.setTextColor(255,255,255); doc.setFontSize(13); doc.setFont("helvetica","bold");
    doc.text(`Predicted Yield: ${tph} T/Ha  (Benchmark: ${benchmark} T/Ha)`, M+5, y+9);
    doc.setFontSize(9); doc.setFont("helvetica","normal");
    doc.text(`Market Price: Rs.${price}/qtl   |   Est. Revenue: Rs.${estimatedRevenue}`, M+5, y+17);
    doc.setTextColor(30,30,30); y+=28;
    row("Yield vs Benchmark", `${Math.round(yieldRatio*100)}% of expected`, true);
    row("Risk Assessment",    risk.label, true);
    row("AI Confidence",      `${confidence}% (based on ${suitability}% suitability)`);
    row("Profitability",      profitability, true);
    row("NDVI Health Score",  ndvi);
    row("Soil Moisture Est.", `${soilMoisture}%`);
    row("Recommended Crop",   result.recommended_crop, true);
    divider();

    if (current_crop_suitability.suitability !== undefined) {
      secTitle("3. CURRENT CROP SUITABILITY");
      row("Suitability Score",  `${suitability}%`);
      row("Predicted Yield",    `${current_crop_suitability.predicted_yield} T/Ha`);
      row("Combined Score",     `${current_crop_suitability.combined_score}/100`);
      row("Market Price",       `Rs.${current_crop_suitability.market_price}/qtl`);
      divider();
    }

    secTitle("4. TOP CROP RECOMMENDATIONS");
    top_recommendations.forEach((rec,i) => {
      checkY(30);
      const isTop = i===0;
      doc.setFillColor(isTop?240:248, isTop?253:250, isTop?244:248);
      doc.roundedRect(M,y,W-M*2,26,2,2,"F");
      if(isTop){doc.setDrawColor(22,163,74);doc.setLineWidth(0.5);doc.roundedRect(M,y,W-M*2,26,2,2,"S");}
      doc.setFontSize(10); doc.setFont("helvetica","bold");
      doc.setTextColor(isTop?22:50, isTop?163:50, isTop?74:50);
      doc.text(`#${i+1}  ${rec.crop}${isTop?" ★ BEST MATCH":""}`, M+4, y+8);
      doc.setFont("helvetica","normal"); doc.setFontSize(8.5); doc.setTextColor(80,80,80);
      doc.text(`Suitability: ${rec.suitability_score}%`, M+4, y+16);
      doc.text(`Yield: ${rec.predicted_yield} T/Ha`, M+55, y+16);
      doc.text(`Price: Rs.${rec.market_price}/qtl`, M+110, y+16);
      doc.text(`Score: ${rec.combined_score}/100`, M+4, y+22);
      doc.setTextColor(30,30,30); y+=30;
    });
    divider();

    secTitle("5. AI INSIGHTS & ADVISORY");
    insights.forEach(ins => {
      checkY(10);
      doc.setFontSize(9); doc.setFont("helvetica","normal"); doc.setTextColor(50,50,50);
      const wrapped = doc.splitTextToSize(`${ins.icon} ${ins.text}`, W-M*2-4);
      doc.text(wrapped, M+2, y); y += wrapped.length*6+3;
    });
    divider();

    secTitle("6. ENVIRONMENTAL SUMMARY");
    const envRows = [
      ["Parameter","Value","Status"],
      ["Rainfall",    `${rainfall} mm`,    rainfall>=optRain*0.5?"Adequate":"Low"],
      ["Temperature", `${temperature}°C`,  temperature>=20&&temperature<=35?"Optimal":"Check"],
      ["Soil Type",   inp.soil||"—",       "Recorded"],
      ["Season",      inp.season||"—",     "Active"],
      ["NDVI Score",  ndvi,                Number(ndvi)>=0.5?"Healthy":"Monitor"],
      ["Soil Moisture",`${soilMoisture}%`, soilMoisture>40?"Good":"Low"],
      ["Suitability", `${suitability}%`,   suitability>=70?"High":"Moderate"],
    ];
    envRows.forEach((r,ri) => {
      checkY(8);
      const isH = ri===0;
      if(isH){doc.setFillColor(22,163,74);doc.rect(M,y-5,W-M*2,8,"F");doc.setTextColor(255,255,255);doc.setFont("helvetica","bold");}
      else{doc.setFillColor(ri%2===0?248:255,ri%2===0?250:255,ri%2===0?248:255);doc.rect(M,y-5,W-M*2,8,"F");doc.setTextColor(50,50,50);doc.setFont("helvetica","normal");}
      doc.setFontSize(9);
      doc.text(r[0],M+3,y); doc.text(r[1],M+65,y); doc.text(r[2],M+130,y);
      doc.setTextColor(30,30,30); y+=8;
    });
    divider();

    checkY(20); y=Math.max(y,265);
    doc.setFillColor(245,245,245); doc.rect(0,y,W,30,"F");
    doc.setFontSize(7.5); doc.setTextColor(120,120,120); doc.setFont("helvetica","italic");
    const disc = "Disclaimer: This report is AI-generated and should be used as decision support only. Consult local agricultural experts before making farming decisions.";
    doc.text(doc.splitTextToSize(disc,W-M*2), M, y+7);
    doc.setFont("helvetica","normal");
    doc.text("Smart Crop Advisor  |  Tamil Nadu Agricultural DSS  |  2025", M, y+20);
    doc.text(`Page 1 of ${doc.getNumberOfPages()}`, W-M-20, y+20);
    doc.save(`Crop_Report_${crop}_${new Date().toISOString().slice(0,10)}.pdf`);
  };

  // ── UI ─────────────────────────────────────────────────────────────────────
  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">

      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-500 px-5 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-white font-bold text-lg">Prediction Results</h3>
            <p className="text-green-100 text-xs mt-0.5">{crop} · {inp.district} · {inp.season}</p>
          </div>
          <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
            riskLevel==="low" ? "bg-emerald-100 text-emerald-800" :
            riskLevel==="medium" ? "bg-amber-100 text-amber-800" : "bg-red-100 text-red-800"
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${risk.dot}`}></span>
            {risk.label}
          </span>
        </div>
      </div>

      <div className="p-5 space-y-5">

        {/* Primary metrics */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-green-50 border border-green-100 rounded-xl p-4">
            <p className="text-xs text-gray-500 font-medium">Predicted Yield</p>
            <p className="text-2xl font-bold text-green-700 mt-1">{tph}</p>
            <p className="text-xs text-green-600">T/Ha · benchmark {benchmark}</p>
            {/* Yield vs benchmark bar */}
            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
              <div className={`h-1.5 rounded-full ${risk.bar}`}
                style={{ width:`${Math.min(100, yieldRatio*100)}%` }}></div>
            </div>
            <p className="text-xs text-gray-400 mt-1">{Math.round(yieldRatio*100)}% of expected</p>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
            <p className="text-xs text-gray-500 font-medium">Market Price</p>
            <p className="text-2xl font-bold text-blue-700 mt-1">₹{price}</p>
            <p className="text-xs text-blue-600">per quintal</p>
          </div>

          <div className="bg-purple-50 border border-purple-100 rounded-xl p-4">
            <p className="text-xs text-gray-500 font-medium">Est. Revenue</p>
            <p className="text-xl font-bold text-purple-700 mt-1">₹{estimatedRevenue}</p>
            <p className="text-xs text-purple-600">for {area} Ha</p>
          </div>

          <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
            <p className="text-xs text-gray-500 font-medium">AI Confidence</p>
            <p className="text-xl font-bold text-gray-700 mt-1">{confidence}%</p>
            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
              <div className="bg-green-500 h-1.5 rounded-full" style={{ width:`${confidence}%` }}></div>
            </div>
            <p className="text-xs text-gray-400 mt-1">from {suitability}% suitability</p>
          </div>
        </div>

        {/* Secondary metrics — all dynamic */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
            <div className="text-lg">🌿</div>
            <p className={`text-sm font-bold mt-1 ${Number(ndvi)>=0.6?"text-emerald-600":Number(ndvi)>=0.4?"text-amber-600":"text-red-600"}`}>{ndvi}</p>
            <p className="text-xs text-gray-400">NDVI Health</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
            <div className="text-lg">💧</div>
            <p className={`text-sm font-bold mt-1 ${soilMoisture>=50?"text-emerald-600":soilMoisture>=30?"text-amber-600":"text-red-600"}`}>{soilMoisture}%</p>
            <p className="text-xs text-gray-400">Soil Moisture</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
            <div className="text-lg">📈</div>
            <p className={`text-sm font-bold mt-1 ${profitColor}`}>{profitability}</p>
            <p className="text-xs text-gray-400">Profitability</p>
          </div>
        </div>

        {/* Recommended crop banner */}
        {isCurrentBest ? (
          <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl p-4">
            <div className="text-2xl">🏆</div>
            <div>
              <p className="text-xs text-emerald-600 font-semibold">Optimal Choice</p>
              <p className="text-sm font-bold text-emerald-700">{crop} is the best crop for your current conditions!</p>
            </div>
          </div>
        ) : Number(yieldGap) > 0 ? (
          <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="text-2xl">🎯</div>
            <div className="flex-1">
              <p className="text-xs text-amber-600 font-semibold">Better Option Available</p>
              <p className="text-sm font-bold text-amber-800">
                Switch to {getCropName(result.recommended_crop)} for +{yieldGap} T/Ha
              </p>
            </div>
          </div>
        ) : null}

        {/* Current crop suitability */}
        {current_crop_suitability.suitability !== undefined && (
          <div className="border border-blue-100 rounded-xl p-4 bg-blue-50">
            <p className="text-xs font-semibold text-blue-600 mb-2">Current Crop Analysis — {crop}</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><span className="text-gray-500">Suitability:</span>
                <span className={`font-semibold ml-1 ${suitability>=70?"text-emerald-700":suitability>=50?"text-amber-700":"text-red-700"}`}>{suitability}%</span></div>
              <div><span className="text-gray-500">Yield:</span>
                <span className="font-semibold ml-1">{current_crop_suitability.predicted_yield} T/Ha</span></div>
              <div><span className="text-gray-500">Score:</span>
                <span className="font-semibold ml-1">{current_crop_suitability.combined_score}/100</span></div>
              <div><span className="text-gray-500">Price:</span>
                <span className="font-semibold ml-1">₹{current_crop_suitability.market_price}</span></div>
            </div>
          </div>
        )}

        {/* Top 3 recommendations */}
        {top_recommendations.length > 0 && (
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">🎯 Top Crop Recommendations</p>
            <div className="space-y-2">
              {top_recommendations.map((rec, i) => {
                const isCurrent = rec.crop === crop;
                return (
                  <div key={rec.crop} className={`rounded-xl p-3 border ${
                    isCurrent ? "bg-emerald-50 border-emerald-300" :
                    i===0 ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-100"
                  }`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`font-semibold text-sm ${isCurrent?"text-emerald-700":i===0?"text-green-700":"text-gray-700"}`}>
                        #{i+1} {getCropName(rec.crop)}
                      </span>
                      <div className="flex gap-1">
                        {isCurrent && <span className="text-xs bg-emerald-200 text-emerald-800 px-2 py-0.5 rounded-full font-medium">Your Crop</span>}
                        {i===0 && !isCurrent && <span className="text-xs bg-green-200 text-green-800 px-2 py-0.5 rounded-full font-medium">Best Match</span>}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-xs text-gray-600">
                      <span>Suitability: <strong>{rec.suitability_score}%</strong></span>
                      <span>Yield: <strong>{rec.predicted_yield} T/Ha</strong></span>
                      <span>Price: <strong>₹{rec.market_price}</strong></span>
                      <span>Score: <strong>{rec.combined_score}/100</strong></span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Dynamic AI Insights */}
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-2">🧠 AI Insights</p>
          <div className="space-y-2">
            {insights.map((ins, i) => (
              <div key={i} className={`flex gap-2.5 p-3 rounded-xl border text-xs ${insightColors[ins.type]}`}>
                <span className="shrink-0 text-sm">{ins.icon}</span>
                <span>{ins.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Download */}
        <button
          onClick={downloadReport}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white rounded-xl py-3 font-semibold shadow-md hover:shadow-lg transition-all duration-200 active:scale-95"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Download Professional Report (PDF)
        </button>
      </div>
    </div>
  );
}
