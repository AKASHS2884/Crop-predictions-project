import YieldMeter from "../components/YieldMeter";

export default function Home({ t }) {

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white p-6">

      {/* HERO SECTION */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-500 text-white p-6 rounded-2xl shadow-lg">

        <h1 className="text-3xl font-bold">
          🌾 தமிழ் நாடு AI பயிர் விளைச்சல் கணிப்பு
        </h1>

        <p className="mt-2 text-sm opacity-90">
          Real-Time Smart Crop Decision Support System (2025)
        </p>

        <div className="mt-4 flex gap-2 flex-wrap">
          <span className="bg-white text-green-600 px-3 py-1 rounded-full text-xs font-semibold">
            Live Weather Enabled
          </span>
          <span className="bg-white text-green-600 px-3 py-1 rounded-full text-xs font-semibold">
            Soil-Aware ML
          </span>
          <span className="bg-white text-green-600 px-3 py-1 rounded-full text-xs font-semibold">
            District-Based Prediction
          </span>
          <span className="bg-white text-green-600 px-3 py-1 rounded-full text-xs font-semibold">
            DSS Advisory Engine
          </span>
        </div>

      </div>

      {/* DASHBOARD GRID */}
      <div className="mt-6 grid grid-cols-2 gap-4">

        <YieldMeter />

        {/* DISTRICT COVERAGE PANEL */}
        <div className="bg-white p-4 rounded-xl shadow-sm border">

          <p className="text-xs text-gray-500">
            District Prediction Coverage
          </p>

          <p className="text-lg font-semibold text-green-600 mt-1">
            38 / 38 Districts Enabled
          </p>

          <div className="w-full bg-gray-200 h-2 mt-3 rounded-full">
            <div className="bg-green-600 h-2 rounded-full w-full"></div>
          </div>

          <p className="text-xs text-gray-400 mt-2">
            AI Prediction Engine active across Tamil Nadu
          </p>

        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border">
          <p className="text-xs text-gray-500">
            Climate Suitability Score
          </p>
          <p className="text-xl font-semibold text-green-600">
            82%
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border">
          <p className="text-xs text-gray-500">
            Soil Health Index
          </p>
          <p className="text-xl font-semibold text-blue-600">
            Optimal
          </p>
        </div>

      </div>

      {/* SYSTEM STATUS */}
      <div className="mt-6 grid grid-cols-2 gap-4">

        <div className="bg-white p-4 rounded-xl shadow-sm border">
          <p className="text-xs text-gray-500">Realtime Status</p>
          <p className="text-lg font-semibold text-green-600">
            🟢 Live System Active
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border">
          <p className="text-xs text-gray-500">Prediction Engine</p>
          <p className="text-lg font-semibold">
            AI-ML DSS Model (2025)
          </p>
        </div>

      </div>

      {/* FEATURE GRID */}
      <div className="mt-6 grid grid-cols-2 gap-4">

        <div className="bg-white p-4 rounded-xl shadow-sm border">
          <p className="font-semibold">📉 Yield Risk Index</p>
          <p className="text-xs text-gray-500">
            Detect potential crop yield risks using ML inference
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border">
          <p className="font-semibold">🌦 Weather Integration</p>
          <p className="text-xs text-gray-500">
            GPS-based live weather forecasting
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border">
          <p className="font-semibold">🌱 Crop Recommendation</p>
          <p className="text-xs text-gray-500">
            AI suggests best crop for your soil
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border">
          <p className="font-semibold">📊 Profitability Index</p>
          <p className="text-xs text-gray-500">
            Market-driven economic insight
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border">
          <p className="font-semibold">📡 NDVI Health Score</p>
          <p className="text-xs text-gray-500">
            Satellite vegetation index estimation
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border">
          <p className="font-semibold">💧 Soil Moisture Estimation</p>
          <p className="text-xs text-gray-500">
            AI irrigation advisory
          </p>
        </div>

      </div>

      {/* DEMO GUIDE */}
      <div className="mt-6 bg-white rounded-xl p-4 shadow-sm border">

        <h3 className="font-semibold text-lg">
          Demo Steps
        </h3>

        <ul className="list-disc pl-4 text-sm mt-2 text-gray-600">
          <li>Allow GPS to auto-detect district</li>
          <li>Realtime weather fetch</li>
          <li>Select crop, season & soil</li>
          <li>Click Predict → AI Advisory</li>
          <li>Download Farmer DSS Report</li>
        </ul>

      </div>

    </div>
  );
}