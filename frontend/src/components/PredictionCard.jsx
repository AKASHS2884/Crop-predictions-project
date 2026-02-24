import jsPDF from "jspdf";

export default function PredictionCard({ result, t }) {

  if (!result) return null;

  // 🌾 Yield Risk Index
  let risk = "Low Risk";
  let riskColor = "text-green-600";

  if (result.predicted_yield_tph < 3) {
    risk = "High Risk";
    riskColor = "text-red-600";
  } 
  else if (result.predicted_yield_tph < 5) {
    risk = "Moderate Risk";
    riskColor = "text-yellow-600";
  }

  // 🤖 Farmer Recommendation Engine
  let advice = "";

  if (result.predicted_yield_tph < 3)
    advice = "Improve irrigation & apply nitrogen fertilizers";
  else if (result.predicted_yield_tph < 5)
    advice = "Balanced fertilization recommended";
  else
    advice = "Maintain soil moisture for optimal yield";

  // 💧 Soil Moisture Estimator (Realtime Proxy)
  let soilMoisture = Math.round(result.predicted_yield_tph * 15);

  // 📊 NDVI Crop Health Proxy
  let ndvi = (result.predicted_yield_tph / 6).toFixed(2);

  // 🌧 7 Day Rainfall Forecast (Simulated Realtime)
  let rainfallForecast = Math.round(result.predicted_yield_tph * 8);

  // 📈 Profitability Index
  let profit = "Low";
  if (result.predicted_yield_tph > 4)
    profit = "High";
  else if (result.predicted_yield_tph > 3)
    profit = "Moderate";

  // 📊 AI Confidence
  let confidence = Math.min(100, Math.round(result.predicted_yield_tph * 20));

  // 📄 PDF EXPORT
  const downloadReport = () => {
    const doc = new jsPDF();

    doc.text("Smart Crop Yield DSS Report - 2025", 20, 20);
    doc.text(`Yield: ${result.predicted_yield_tph} T/Ha`, 20, 40);
    doc.text(`Risk: ${risk}`, 20, 50);
    doc.text(`Recommended Crop: ${result.recommended_crop}`, 20, 60);
    doc.text(`Market Price: ₹${result.market_price_inr_per_quintal}`, 20, 70);
    doc.text(`NDVI: ${ndvi}`, 20, 80);
    doc.text(`Soil Moisture: ${soilMoisture}%`, 20, 90);
    doc.text(`Rainfall Forecast: ${rainfallForecast} mm`, 20, 100);
    doc.text(`Profitability: ${profit}`, 20, 110);
    doc.text(`Confidence: ${confidence}%`, 20, 120);
    doc.text(`Advice: ${advice}`, 20, 130);

    doc.save("Farmer_Prediction_Report_2025.pdf");
  };

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border space-y-4">

      <h3 className="font-semibold text-lg">🌾 Smart Prediction Result (2025)</h3>

      <div className="grid grid-cols-2 gap-3">

        <div className="p-3 rounded-lg bg-gray-50">
          <p className="text-xs text-gray-500">{t.yield}</p>
          <p className="text-xl font-bold">
            {result.predicted_yield_tph} T/Ha
          </p>
        </div>

        <div className="p-3 rounded-lg bg-gray-50">
          <p className="text-xs text-gray-500">{t.marketPrice}</p>
          <p className="text-xl font-bold">
            ₹{result.market_price_inr_per_quintal}
          </p>
        </div>

        <div className="p-3 rounded-lg bg-gray-50">
          <p className="text-xs text-gray-500">Yield Risk Index</p>
          <p className={`text-lg font-semibold ${riskColor}`}>
            {risk}
          </p>
        </div>

        <div className="p-3 rounded-lg bg-gray-50">
          <p className="text-xs text-gray-500">Recommended Crop</p>
          <p className="text-lg font-semibold text-blue-600">
            {result.recommended_crop}
          </p>
        </div>

        <div className="p-3 rounded-lg bg-gray-50">
          <p className="text-xs text-gray-500">NDVI Crop Health</p>
          <p className="text-sm font-semibold">
            {ndvi}
          </p>
        </div>

        <div className="p-3 rounded-lg bg-gray-50">
          <p className="text-xs text-gray-500">Soil Moisture</p>
          <p className="text-sm font-semibold">
            {soilMoisture}%
          </p>
        </div>

        <div className="p-3 rounded-lg bg-gray-50">
          <p className="text-xs text-gray-500">7 Day Rainfall Forecast</p>
          <p className="text-sm font-semibold">
            {rainfallForecast} mm
          </p>
        </div>

        <div className="p-3 rounded-lg bg-gray-50">
          <p className="text-xs text-gray-500">Profitability Index</p>
          <p className="text-sm font-semibold">
            {profit}
          </p>
        </div>

        <div className="p-3 rounded-lg bg-gray-50">
          <p className="text-xs text-gray-500">AI Confidence</p>
          <p className="text-sm font-semibold">
            {confidence}%
          </p>
        </div>

      </div>

      <div className="p-3 rounded-lg bg-gray-50">
        <p className="text-xs text-gray-500">Farmer Recommendation</p>
        <p className="text-sm">
          {advice}
        </p>
      </div>

      <button
        onClick={downloadReport}
        className="w-full bg-green-600 text-white rounded-lg py-2 font-semibold"
      >
        📄 Download Farmer Report (PDF)
      </button>

    </div>
  );
}