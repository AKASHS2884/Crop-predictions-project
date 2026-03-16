import { useState, useEffect } from "react";
import { MobileCard, MobileButton } from "../components/MobileOptimized";

export default function History({ t, isMobile }) {
  const [predictions, setPredictions] = useState([]);
  const [selectedPrediction, setSelectedPrediction] = useState(null);

  // Load prediction history from localStorage
  useEffect(() => {
    const savedPredictions = localStorage.getItem('cropPredictions');
    if (savedPredictions) {
      setPredictions(JSON.parse(savedPredictions));
    }
  }, []);

  const clearHistory = () => {
    localStorage.removeItem('cropPredictions');
    setPredictions([]);
  };

  const exportHistory = () => {
    const dataStr = JSON.stringify(predictions, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'crop_prediction_history.json';
    link.click();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRiskColor = (yield_value) => {
    if (yield_value < 3) return "text-red-600 bg-red-50";
    if (yield_value < 5) return "text-yellow-600 bg-yellow-50";
    return "text-green-600 bg-green-50";
  };

  const getRiskText = (yield_value) => {
    if (yield_value < 3) return "High Risk";
    if (yield_value < 5) return "Moderate Risk";
    return "Low Risk";
  };

  if (isMobile) {
    return (
      <div className="space-y-4">
        {/* Header */}
        <MobileCard className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">📊 Prediction History</h2>
            <span className="text-sm text-gray-500">{predictions.length} records</span>
          </div>
          
          {predictions.length > 0 && (
            <div className="flex gap-2">
              <MobileButton 
                variant="secondary" 
                onClick={exportHistory}
                className="flex-1"
              >
                📤 Export
              </MobileButton>
              <MobileButton 
                variant="danger" 
                onClick={clearHistory}
                className="flex-1"
              >
                🗑️ Clear
              </MobileButton>
            </div>
          )}
        </MobileCard>

        {/* Predictions List */}
        {predictions.length === 0 ? (
          <MobileCard className="p-8 text-center">
            <div className="text-6xl mb-4">📈</div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No Predictions Yet</h3>
            <p className="text-gray-500 text-sm">Start making crop predictions to see your history here.</p>
          </MobileCard>
        ) : (
          <div className="space-y-3">
            {predictions.map((prediction, index) => (
              <MobileCard key={index} className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-800">{prediction.crop}</h3>
                    <p className="text-sm text-gray-500">{prediction.district} • {prediction.season}</p>
                    <p className="text-xs text-gray-400">{formatDate(prediction.timestamp)}</p>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(prediction.predicted_yield_tph)}`}>
                    {getRiskText(prediction.predicted_yield_tph)}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="bg-gray-50 p-2 rounded-lg">
                    <p className="text-xs text-gray-500">Predicted Yield</p>
                    <p className="font-semibold">{prediction.predicted_yield_tph} T/Ha</p>
                  </div>
                  <div className="bg-gray-50 p-2 rounded-lg">
                    <p className="text-xs text-gray-500">Recommended</p>
                    <p className="font-semibold text-green-600">{prediction.recommended_crop}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <span className="text-gray-600">🌡️ {prediction.temperature}°C</span>
                    <span className="text-gray-600">🌧️ {prediction.rainfall}mm</span>
                  </div>
                  <button 
                    onClick={() => setSelectedPrediction(selectedPrediction === index ? null : index)}
                    className="text-blue-600 font-medium"
                  >
                    {selectedPrediction === index ? 'Less' : 'More'}
                  </button>
                </div>

                {selectedPrediction === index && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-600">Soil:</span>
                        <span className="ml-1 font-medium">{prediction.soil}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Area:</span>
                        <span className="ml-1 font-medium">{prediction.area} Ha</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Market Price:</span>
                        <span className="ml-1 font-medium">₹{prediction.market_price_inr_per_quintal}</span>
                      </div>
                      {prediction.current_crop_suitability && (
                        <div>
                          <span className="text-gray-600">Suitability:</span>
                          <span className="ml-1 font-medium">{prediction.current_crop_suitability.suitability}%</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </MobileCard>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Desktop version
  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">📊 Prediction History</h2>
          <div className="flex gap-3">
            {predictions.length > 0 && (
              <>
                <button 
                  onClick={exportHistory}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Export Data
                </button>
                <button 
                  onClick={clearHistory}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Clear History
                </button>
              </>
            )}
          </div>
        </div>

        {predictions.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-8xl mb-4">📈</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Predictions Yet</h3>
            <p className="text-gray-500">Start making crop predictions to see your history here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Date</th>
                  <th className="text-left p-3">Crop</th>
                  <th className="text-left p-3">District</th>
                  <th className="text-left p-3">Yield</th>
                  <th className="text-left p-3">Recommended</th>
                  <th className="text-left p-3">Risk</th>
                </tr>
              </thead>
              <tbody>
                {predictions.map((prediction, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="p-3 text-sm">{formatDate(prediction.timestamp)}</td>
                    <td className="p-3 font-medium">{prediction.crop}</td>
                    <td className="p-3">{prediction.district}</td>
                    <td className="p-3 font-semibold">{prediction.predicted_yield_tph} T/Ha</td>
                    <td className="p-3 text-green-600 font-medium">{prediction.recommended_crop}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(prediction.predicted_yield_tph)}`}>
                        {getRiskText(prediction.predicted_yield_tph)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}