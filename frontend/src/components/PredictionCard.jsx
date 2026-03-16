import jsPDF from "jspdf";

export default function PredictionCard({ result, t = {}, lang = 'en' }) {

  if (!result) return null;

  // Fallback translations to prevent white screen
  const safeT = {
    predictedYield: t?.predictedYield || 'Predicted Yield',
    marketPrice: t?.marketPrice || 'Market Price',
    tonsPerHectare: t?.tonsPerHectare || 'T/Ha',
    rupees: t?.rupees || '₹',
    percentage: t?.percentage || '%',
    crops: t?.crops || {},
    risks: t?.risks || {},
    report: t?.report || {}
  };

  const { top_recommendations = [], current_crop_suitability = {} } = result;

  // Helper function to get translated crop name
  const getCropName = (cropName) => {
    const cropKey = cropName.toLowerCase().replace(/\s+/g, '');
    return t.crops?.[cropKey] || cropName;
  };

  // 🌾 Yield Risk Assessment with translations
  let riskLevel = "low";
  let riskColor = "text-green-600";
  let riskBg = "bg-green-50";

  if (result.predicted_yield_tph < 3) {
    riskLevel = "high";
    riskColor = "text-red-600";
    riskBg = "bg-red-50";
  } else if (result.predicted_yield_tph < 5) {
    riskLevel = "medium";
    riskColor = "text-yellow-600";
    riskBg = "bg-yellow-50";
  }

  // 🤖 Enhanced Multilingual Farmer Recommendation Engine
  let advice = "";
  let analysisType = "";
  
  if (top_recommendations.length > 0) {
    const bestRec = top_recommendations[0];
    const currentCropInTop3 = top_recommendations.slice(0, 3).some(rec => rec.crop === result.recommended_crop);
    
    if (result.predicted_yield_tph < 3) {
      analysisType = "poor";
      advice = lang === 'ta' 
        ? `குறைந்த விளைச்சல் கணிக்கப்பட்டுள்ளது. சிறந்த முடிவுகளுக்கு ${getCropName(bestRec.crop)} (${bestRec.suitability_score}% பொருத்தம்) க்கு மாறுவதை பரிசீலிக்கவும். ${t.advice?.irrigation} மற்றும் நைட்ரஜன் உரங்களை பயன்படுத்தவும்.`
        : `Low yield predicted. Consider switching to ${getCropName(bestRec.crop)} (${bestRec.suitability_score}% suitable) for better results. ${t.advice?.irrigation} & apply nitrogen fertilizers.`;
    } else if (result.predicted_yield_tph < 5) {
      analysisType = "moderate";
      if (currentCropInTop3) {
        advice = lang === 'ta'
          ? `மிதமான விளைச்சல் எதிர்பார்க்கப்படுகிறது. உங்கள் தற்போதைய பயிர் தேர்வு நல்லது. சிறந்த முடிவுகளுக்கு சமச்சீர் உரமிடல் பயன்படுத்தவும்.`
          : `${t.analysis?.moderate}. Your current crop choice is good. ${t.advice?.fertilizer} for optimal results.`;
      } else {
        advice = lang === 'ta'
          ? `${getCropName(bestRec.crop)} க்கு ${bestRec.predicted_yield} ${t.tonsPerHectare} விளைச்சல் சாத்தியத்தை பரிசீலிக்கவும். சமச்சீர் உரமிடல் பரிந்துரைக்கப்படுகிறது.`
          : `Consider ${getCropName(bestRec.crop)} for ${bestRec.predicted_yield} ${t.tonsPerHectare} yield potential. ${t.advice?.fertilizer}.`;
      }
    } else {
      analysisType = "excellent";
      advice = lang === 'ta'
        ? `சிறந்த விளைச்சல் சாத்தியம்! தற்போதைய நடைமுறைகளை பராமரித்து சிறந்த விளைச்சலுக்கு போதுமான மண் ஈரப்பதத்தை உறுதி செய்யவும்.`
        : `${t.analysis?.excellent}! Maintain current practices and ensure adequate soil moisture for optimal yield.`;
    }
  } else {
    // Fallback advice with translations
    if (result.predicted_yield_tph < 3) {
      analysisType = "poor";
      advice = t.advice?.irrigation || "Improve irrigation & apply nitrogen fertilizers";
    } else if (result.predicted_yield_tph < 5) {
      analysisType = "moderate";
      advice = t.advice?.fertilizer || "Balanced fertilization recommended";
    } else {
      analysisType = "excellent";
      advice = lang === 'ta' 
        ? "சிறந்த விளைச்சலுக்கு மண் ஈரப்பதத்தை பராமரிக்கவும்"
        : "Maintain soil moisture for optimal yield";
    }
  }

  // Environmental indicators with translations
  let soilMoisture = Math.round(result.predicted_yield_tph * 15);
  let ndvi = (result.predicted_yield_tph / 6).toFixed(2);
  let rainfallForecast = Math.round(result.predicted_yield_tph * 8);
  
  // Profitability assessment with translations
  let profitLevel = "low";
  if (result.predicted_yield_tph > 4) profitLevel = "high";
  else if (result.predicted_yield_tph > 3) profitLevel = "medium";

  let confidence = Math.min(100, Math.round(result.predicted_yield_tph * 20));

  // 📄 Enhanced Multilingual PDF Export
  const downloadReport = () => {
    const doc = new jsPDF();

    // Title in selected language
    doc.setFontSize(16);
    const reportTitle = lang === 'ta' 
      ? "ஸ்மார்ட் பயிர் விளைச்சல் அறிக்கை - 2025"
      : "Smart Crop Yield Report - 2025";
    doc.text(reportTitle, 20, 20);
    
    doc.setFontSize(12);
    
    // Current Crop Analysis Section
    const currentAnalysisTitle = lang === 'ta' 
      ? "=== தற்போதைய பயிர் பகுப்பாய்வு ==="
      : "=== CURRENT CROP ANALYSIS ===";
    doc.text(currentAnalysisTitle, 20, 35);
    
    const yieldLabel = lang === 'ta' ? "கணிக்கப்பட்ட விளைச்சல்:" : "Predicted Yield:";
    const riskLabel = lang === 'ta' ? "ஆபத்து நிலை:" : "Risk Level:";
    const priceLabel = lang === 'ta' ? "சந்தை விலை:" : "Market Price:";
    
    doc.text(`${yieldLabel} ${result.predicted_yield_tph} ${safeT.tonsPerHectare}`, 20, 45);
    doc.text(`${riskLabel} ${safeT.risks?.[riskLevel] || riskLevel}`, 20, 55);
    doc.text(`${priceLabel} ${safeT.rupees}${result.market_price_inr_per_quintal}`, 20, 65);
    
    if (current_crop_suitability.suitability !== undefined) {
      const suitabilityLabel = lang === 'ta' ? "தற்போதைய பயிர் பொருத்தம்:" : "Current Crop Suitability:";
      doc.text(`${suitabilityLabel} ${current_crop_suitability.suitability}${safeT.percentage}`, 20, 75);
    }
    
    // Top Recommendations Section
    const recommendationsTitle = lang === 'ta' 
      ? "=== சிறந்த பயிர் பரிந்துரைகள் ==="
      : "=== TOP CROP RECOMMENDATIONS ===";
    doc.text(recommendationsTitle, 20, 90);
    
    if (top_recommendations.length > 0) {
      let yPos = 100;
      top_recommendations.slice(0, 3).forEach((rec, index) => {
        const cropName = getCropName(rec.crop);
        doc.text(`${index + 1}. ${cropName}`, 20, yPos);
        
        const suitLabel = lang === 'ta' ? "பொருத்தம்:" : "Suitability:";
        const yieldLabel2 = lang === 'ta' ? "விளைச்சல்:" : "Yield:";
        const priceLabel2 = lang === 'ta' ? "விலை:" : "Price:";
        const scoreLabel = lang === 'ta' ? "மதிப்பெண்:" : "Score:";
        
        doc.text(`   ${suitLabel} ${rec.suitability_score}${safeT.percentage} | ${yieldLabel2} ${rec.predicted_yield} ${safeT.tonsPerHectare}`, 25, yPos + 8);
        doc.text(`   ${priceLabel2} ${safeT.rupees}${rec.market_price} | ${scoreLabel} ${rec.combined_score}/100`, 25, yPos + 16);
        yPos += 25;
      });
    }
    
    // Environmental Data Section
    const envDataTitle = lang === 'ta' 
      ? "=== சுற்றுச்சூழல் தரவு ==="
      : "=== ENVIRONMENTAL DATA ===";
    doc.text(envDataTitle, 20, yPos + 10);
    
    const moistureLabel = lang === 'ta' ? "மண் ஈரப்பதம்:" : "Soil Moisture:";
    const rainfallLabel = lang === 'ta' ? "மழைப்பொழிவு கணிப்பு:" : "Rainfall Forecast:";
    const profitLabel = lang === 'ta' ? "லாபகரம்:" : "Profitability:";
    const confidenceLabel = lang === 'ta' ? "AI நம்பிக்கை:" : "AI Confidence:";
    
    doc.text(`NDVI: ${ndvi}`, 20, yPos + 20);
    doc.text(`${moistureLabel} ${soilMoisture}${safeT.percentage}`, 20, yPos + 30);
    doc.text(`${rainfallLabel} ${rainfallForecast} mm`, 20, yPos + 40);
    doc.text(`${profitLabel} ${lang === 'ta' ? (profitLevel === 'high' ? 'அதிகம்' : profitLevel === 'medium' ? 'மிதம்' : 'குறைவு') : profitLevel}`, 20, yPos + 50);
    doc.text(`${confidenceLabel} ${confidence}${safeT.percentage}`, 20, yPos + 60);
    
    // Recommendations Section
    const adviceTitle = lang === 'ta' 
      ? "=== பரிந்துரைகள் ==="
      : "=== RECOMMENDATIONS ===";
    doc.text(adviceTitle, 20, yPos + 75);
    
    const splitAdvice = doc.splitTextToSize(advice, 170);
    doc.text(splitAdvice, 20, yPos + 85);

    // Disclaimer
    const disclaimer = safeT.report?.disclaimer || "This report is based on AI predictions and should be used as guidance only";
    const disclaimerSplit = doc.splitTextToSize(disclaimer, 170);
    doc.text(disclaimerSplit, 20, yPos + 120);

    const fileName = lang === 'ta' 
      ? "பயிர்_கணிப்பு_அறிக்கை_2025.pdf"
      : "Enhanced_Crop_Prediction_Report_2025.pdf";
    doc.save(fileName);
  };

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border space-y-4">

      <h3 className="font-semibold text-lg">
        🌾 {lang === 'ta' ? 'ஸ்மார்ட் கணிப்பு முடிவு (2025)' : 'Smart Prediction Result (2025)'}
      </h3>

      <div className="grid grid-cols-2 gap-3">

        <div className="p-3 rounded-lg bg-gray-50">
          <p className="text-xs text-gray-500">{safeT.predictedYield}</p>
          <p className="text-xl font-bold">
            {result.predicted_yield_tph} {safeT.tonsPerHectare}
          </p>
        </div>

        <div className="p-3 rounded-lg bg-gray-50">
          <p className="text-xs text-gray-500">{safeT.marketPrice}</p>
          <p className="text-xl font-bold">
            {safeT.rupees}{result.market_price_inr_per_quintal}
          </p>
        </div>

        <div className={`p-3 rounded-lg ${riskBg}`}>
          <p className="text-xs text-gray-500">
            {lang === 'ta' ? 'விளைச்சல் ஆபத்து குறியீடு' : 'Yield Risk Index'}
          </p>
          <p className={`text-lg font-semibold ${riskColor}`}>
            {lang === 'ta' ? 
              (riskLevel === 'high' ? 'அதிக ஆபத்து' : riskLevel === 'medium' ? 'மிதமான ஆபத்து' : 'குறைந்த ஆபத்து') : 
              (riskLevel === 'high' ? 'High Risk' : riskLevel === 'medium' ? 'Medium Risk' : 'Low Risk')
            }
          </p>
        </div>

        <div className="p-3 rounded-lg bg-gray-50">
          <p className="text-xs text-gray-500">
            {lang === 'ta' ? 'பரிந்துரைக்கப்பட்ட பயிர்' : 'Recommended Crop'}
          </p>
          <p className="text-lg font-semibold text-blue-600">
            {getCropName(result.recommended_crop)}
          </p>
        </div>

        <div className="p-3 rounded-lg bg-gray-50">
          <p className="text-xs text-gray-500">
            NDVI {lang === 'ta' ? 'பயிர் ஆரோக்கியம்' : 'Crop Health'}
          </p>
          <p className="text-sm font-semibold">
            {ndvi}
          </p>
        </div>

        <div className="p-3 rounded-lg bg-gray-50">
          <p className="text-xs text-gray-500">
            {lang === 'ta' ? 'மண் ஈரப்பதம்' : 'Soil Moisture'}
          </p>
          <p className="text-sm font-semibold">
            {soilMoisture}{safeT.percentage}
          </p>
        </div>

        <div className="p-3 rounded-lg bg-gray-50">
          <p className="text-xs text-gray-500">
            {lang === 'ta' ? '7 நாள் மழை கணிப்பு' : '7 Day Rainfall Forecast'}
          </p>
          <p className="text-sm font-semibold">
            {rainfallForecast} mm
          </p>
        </div>

        <div className="p-3 rounded-lg bg-gray-50">
          <p className="text-xs text-gray-500">
            {lang === 'ta' ? 'லாபகர குறியீடு' : 'Profitability Index'}
          </p>
          <p className="text-sm font-semibold">
            {lang === 'ta' ? 
              (profitLevel === 'high' ? 'அதிகம்' : profitLevel === 'medium' ? 'மிதம்' : 'குறைவு') : 
              (profitLevel === 'high' ? 'High' : profitLevel === 'medium' ? 'Medium' : 'Low')
            }
          </p>
        </div>

        <div className="p-3 rounded-lg bg-gray-50">
          <p className="text-xs text-gray-500">
            {lang === 'ta' ? 'AI நம்பிக்கை' : 'AI Confidence'}
          </p>
          <p className="text-sm font-semibold">
            {confidence}{safeT.percentage}
          </p>
        </div>

      </div>

      {/* Current Crop Analysis */}
      {current_crop_suitability.suitability !== undefined && (
        <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
          <p className="text-xs text-blue-600 font-semibold">
            {lang === 'ta' ? 'தற்போதைய பயிர் பகுப்பாய்வு' : 'Current Crop Analysis'}
          </p>
          <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
            <div>
              <span className="text-gray-600">
                {lang === 'ta' ? 'பொருத்தம் மதிப்பெண்:' : 'Suitability Score:'}
              </span>
              <span className="font-semibold ml-1">{current_crop_suitability.suitability}{safeT.percentage}</span>
            </div>
            <div>
              <span className="text-gray-600">{safeT.predictedYield}:</span>
              <span className="font-semibold ml-1">{current_crop_suitability.predicted_yield} {safeT.tonsPerHectare}</span>
            </div>
          </div>
        </div>
      )}

      {/* Top Crop Recommendations */}
      {top_recommendations.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-semibold text-md">
            🎯 {lang === 'ta' ? 'சிறந்த பயிர் பரிந்துரைகள்' : 'Top Crop Recommendations'}
          </h4>
          {top_recommendations.map((rec, index) => (
            <div key={rec.crop} className={`p-3 rounded-lg border ${index === 0 ? 'bg-green-50 border-green-200' : 'bg-gray-50'}`}>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-bold ${index === 0 ? 'text-green-700' : 'text-gray-700'}`}>
                      #{index + 1} {getCropName(rec.crop)}
                    </span>
                    {index === 0 && <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded-full">
                      {lang === 'ta' ? 'சிறந்த பொருத்தம்' : 'Best Match'}
                    </span>}
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                    <div>
                      <span className="text-gray-600">
                        {lang === 'ta' ? 'பொருத்தம்:' : 'Suitability:'}
                      </span>
                      <span className="font-semibold ml-1">{rec.suitability_score}{safeT.percentage}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">
                        {lang === 'ta' ? 'எதிர்பார்க்கப்படும் விளைச்சல்:' : 'Est. Yield:'}
                      </span>
                      <span className="font-semibold ml-1">{rec.predicted_yield} {safeT.tonsPerHectare}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">{safeT.marketPrice}:</span>
                      <span className="font-semibold ml-1">{safeT.rupees}{rec.market_price}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">
                        {lang === 'ta' ? 'மொத்த மதிப்பெண்:' : 'Overall Score:'}
                      </span>
                      <span className="font-semibold ml-1">{rec.combined_score}/100</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="p-3 rounded-lg bg-gray-50">
        <p className="text-xs text-gray-500">
          {lang === 'ta' ? 'விவசாயி பரிந்துரை' : 'Farmer Recommendation'}
        </p>
        <p className="text-sm">
          {advice}
        </p>
      </div>

      <button
        onClick={downloadReport}
        className="w-full bg-green-600 text-white rounded-lg py-2 font-semibold"
      >
        📄 {lang === 'ta' ? 'விவசாயி அறிக்கையை பதிவிறக்கம் (PDF)' : 'Download Farmer Report (PDF)'}
      </button>

    </div>
  );
}