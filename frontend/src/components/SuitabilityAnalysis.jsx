export default function SuitabilityAnalysis({ result, formData, t, lang }) {
  if (!result || !result.top_recommendations || result.top_recommendations.length === 0) {
    return null;
  }

  const bestRec = result.top_recommendations[0];
  const currentCrop = result.current_crop_suitability;

  // Helper function to get translated crop name
  const getCropName = (cropName) => {
    const cropKey = cropName.toLowerCase().replace(/\s+/g, '');
    return t.crops?.[cropKey] || cropName;
  };

  // Determine suitability factors with translations
  const getSuitabilityFactors = (crop, suitabilityScore) => {
    const factors = [];
    
    if (suitabilityScore >= 80) {
      factors.push({ 
        factor: lang === 'ta' ? "சிறந்த சுற்றுச்சூழல் பொருத்தம்" : "Excellent environmental match", 
        status: "excellent" 
      });
    } else if (suitabilityScore >= 60) {
      factors.push({ 
        factor: lang === 'ta' ? "நல்ல சுற்றுச்சூழல் நிலைமைகள்" : "Good environmental conditions", 
        status: "good" 
      });
    } else if (suitabilityScore >= 40) {
      factors.push({ 
        factor: lang === 'ta' ? "மிதமான பொருத்தம்" : "Moderate suitability", 
        status: "moderate" 
      });
    } else {
      factors.push({ 
        factor: lang === 'ta' ? "சவாலான நிலைமைகள்" : "Challenging conditions", 
        status: "poor" 
      });
    }

    // Add specific factors based on crop type with translations
    if (crop === "Rice" && formData.soil === "Alluvial") {
      factors.push({ 
        factor: lang === 'ta' ? "நெல் சாகுபடிக்கு சிறந்த மண் வகை" : "Ideal soil type for rice cultivation", 
        status: "excellent" 
      });
    }
    if (crop === "Cotton" && formData.soil === "Black") {
      factors.push({ 
        factor: lang === 'ta' ? "பருத்திக்கு கருப்பு மண் சிறந்தது" : "Black soil perfect for cotton", 
        status: "excellent" 
      });
    }
    if (crop === "Millets" && formData.rainfall < 75) {
      factors.push({ 
        factor: lang === 'ta' ? "குறைந்த நீர் தேவை பயிர்" : "Low water requirement crop", 
        status: "good" 
      });
    }

    return factors;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "excellent": return "text-green-600 bg-green-50";
      case "good": return "text-blue-600 bg-blue-50";
      case "moderate": return "text-yellow-600 bg-yellow-50";
      case "poor": return "text-red-600 bg-red-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  const bestFactors = getSuitabilityFactors(bestRec.crop, bestRec.suitability_score);
  const currentFactors = currentCrop.suitability ? getSuitabilityFactors(formData.crop, currentCrop.suitability) : [];

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border space-y-4">
      <h3 className="font-semibold text-lg flex items-center gap-2">
        🔍 {lang === 'ta' ? 'பொருத்தம் பகுப்பாய்வு' : 'Suitability Analysis'}
      </h3>

      {/* Best Recommendation Analysis */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-green-700">
            {lang === 'ta' 
              ? `ஏன் ${getCropName(bestRec.crop)} பரிந்துரைக்கப்படுகிறது:` 
              : `Why ${getCropName(bestRec.crop)} is recommended:`}
          </h4>
          <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">
            {bestRec.suitability_score}{t.percentage} {lang === 'ta' ? 'பொருத்தம்' : 'Match'}
          </span>
        </div>
        
        <div className="space-y-2">
          {bestFactors.map((factor, index) => (
            <div key={index} className={`p-2 rounded-lg ${getStatusColor(factor.status)}`}>
              <span className="text-sm">• {factor.factor}</span>
            </div>
          ))}
          
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 bg-gray-50 rounded">
              <span className="text-gray-600">{t.predictedYield}:</span>
              <span className="font-semibold ml-1">{bestRec.predicted_yield} {t.tonsPerHectare}</span>
            </div>
            <div className="p-2 bg-gray-50 rounded">
              <span className="text-gray-600">{lang === 'ta' ? 'சந்தை மதிப்பு:' : 'Market Value:'}:</span>
              <span className="font-semibold ml-1">{t.rupees}{bestRec.market_price}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Current Crop Comparison */}
      {currentCrop.suitability !== undefined && formData.crop !== bestRec.crop && (
        <div className="border-t pt-3 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-blue-700">
              {lang === 'ta' 
                ? `தற்போதைய பயிர் (${getCropName(formData.crop)}) பகுப்பாய்வு:` 
                : `Current crop (${getCropName(formData.crop)}) analysis:`}
            </h4>
            <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              {currentCrop.suitability}{t.percentage} {lang === 'ta' ? 'பொருத்தம்' : 'Match'}
            </span>
          </div>
          
          <div className="space-y-2">
            {currentFactors.map((factor, index) => (
              <div key={index} className={`p-2 rounded-lg ${getStatusColor(factor.status)}`}>
                <span className="text-sm">• {factor.factor}</span>
              </div>
            ))}
            
            {currentCrop.suitability < bestRec.suitability_score && (
              <div className="p-2 bg-orange-50 text-orange-700 rounded-lg text-sm">
                💡 {lang === 'ta' 
                  ? `${getCropName(bestRec.crop)} க்கு மாறுவது விளைச்சலை ${(bestRec.predicted_yield - currentCrop.predicted_yield).toFixed(1)} ${t.tonsPerHectare} மேம்படுத்தலாம்`
                  : `Switching to ${getCropName(bestRec.crop)} could improve yield by ${(bestRec.predicted_yield - currentCrop.predicted_yield).toFixed(1)} ${t.tonsPerHectare}`}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Environmental Conditions Summary */}
      <div className="border-t pt-3">
        <h4 className="font-medium text-gray-700 mb-2">
          {lang === 'ta' ? 'தற்போதைய நிலைமைகள்:' : 'Current Conditions:'}
        </h4>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2 bg-gray-50 rounded">
            <span className="text-gray-600">{t.rainfall}:</span>
            <span className="font-semibold ml-1">{formData.rainfall || 0} {t.millimeters}</span>
          </div>
          <div className="p-2 bg-gray-50 rounded">
            <span className="text-gray-600">{t.temperature}:</span>
            <span className="font-semibold ml-1">{formData.temperature || 0}{t.celsius}</span>
          </div>
          <div className="p-2 bg-gray-50 rounded">
            <span className="text-gray-600">{lang === 'ta' ? 'மண் வகை:' : 'Soil Type:'}:</span>
            <span className="font-semibold ml-1">{t.soilTypes?.[formData.soil?.toLowerCase()] || formData.soil}</span>
          </div>
          <div className="p-2 bg-gray-50 rounded">
            <span className="text-gray-600">{t.season}:</span>
            <span className="font-semibold ml-1">{t.seasons?.[formData.season?.toLowerCase()] || formData.season}</span>
          </div>
        </div>
      </div>
    </div>
  );
}