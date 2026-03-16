import YieldMeter from "../components/YieldMeter";

export default function Home({ t, lang, isMobile }) {

  // Helper function to get feature translations
  const getFeatureText = (key, fallback) => {
    return t[key] || fallback;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white p-6">

      {/* HERO SECTION */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-500 text-white p-6 rounded-2xl shadow-lg">

        <h1 className="text-3xl font-bold">
          🌾 {t.homeTitle}
        </h1>

        <p className="mt-2 text-sm opacity-90">
          {t.homeDesc}
        </p>

        <div className="mt-4 flex gap-2 flex-wrap">
          <span className="bg-white text-green-600 px-3 py-1 rounded-full text-xs font-semibold">
            {lang === 'ta' ? 'நேரடி வானிலை இயக்கப்பட்டது' : 'Live Weather Enabled'}
          </span>
          <span className="bg-white text-green-600 px-3 py-1 rounded-full text-xs font-semibold">
            {lang === 'ta' ? 'மண்-அறிவு ML' : 'Soil-Aware ML'}
          </span>
          <span className="bg-white text-green-600 px-3 py-1 rounded-full text-xs font-semibold">
            {lang === 'ta' ? 'மாவட்ட-அடிப்படை கணிப்பு' : 'District-Based Prediction'}
          </span>
          <span className="bg-white text-green-600 px-3 py-1 rounded-full text-xs font-semibold">
            {lang === 'ta' ? 'DSS ஆலோசனை இயந்திரம்' : 'DSS Advisory Engine'}
          </span>
        </div>

      </div>

      {/* DASHBOARD GRID */}
      <div className="mt-6 grid grid-cols-2 gap-4">

        <YieldMeter t={t} lang={lang} />

        {/* DISTRICT COVERAGE PANEL */}
        <div className="bg-white p-4 rounded-xl shadow-sm border">

          <p className="text-xs text-gray-500">
            {lang === 'ta' ? 'மாவட்ட கணிப்பு கவரேஜ்' : 'District Prediction Coverage'}
          </p>

          <p className="text-lg font-semibold text-green-600 mt-1">
            38 / 38 {lang === 'ta' ? 'மாவட்டங்கள் இயக்கப்பட்டன' : 'Districts Enabled'}
          </p>

          <div className="w-full bg-gray-200 h-2 mt-3 rounded-full">
            <div className="bg-green-600 h-2 rounded-full w-full"></div>
          </div>

          <p className="text-xs text-gray-400 mt-2">
            {lang === 'ta' ? 'தமிழ்நாடு முழுவதும் AI கணிப்பு இயந்திரம் செயலில்' : 'AI Prediction Engine active across Tamil Nadu'}
          </p>

        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border">
          <p className="text-xs text-gray-500">
            {lang === 'ta' ? 'காலநிலை பொருத்தம் மதிப்பெண்' : 'Climate Suitability Score'}
          </p>
          <p className="text-xl font-semibold text-green-600">
            82{t.percentage}
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border">
          <p className="text-xs text-gray-500">
            {lang === 'ta' ? 'மண் ஆரோக்கிய குறியீடு' : 'Soil Health Index'}
          </p>
          <p className="text-xl font-semibold text-blue-600">
            {lang === 'ta' ? 'சிறந்த' : 'Optimal'}
          </p>
        </div>

      </div>

      {/* SYSTEM STATUS */}
      <div className="mt-6 grid grid-cols-2 gap-4">

        <div className="bg-white p-4 rounded-xl shadow-sm border">
          <p className="text-xs text-gray-500">
            {lang === 'ta' ? 'நேரடி நிலை' : 'Realtime Status'}
          </p>
          <p className="text-lg font-semibold text-green-600">
            🟢 {lang === 'ta' ? 'நேரடி அமைப்பு செயலில்' : 'Live System Active'}
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border">
          <p className="text-xs text-gray-500">
            {lang === 'ta' ? 'கணிப்பு இயந்திரம்' : 'Prediction Engine'}
          </p>
          <p className="text-lg font-semibold">
            AI-ML DSS {lang === 'ta' ? 'மாதிரி' : 'Model'} (2025)
          </p>
        </div>

      </div>

      {/* FEATURE GRID */}
      <div className="mt-6 grid grid-cols-2 gap-4">

        <div className="bg-white p-4 rounded-xl shadow-sm border">
          <p className="font-semibold">
            📉 {lang === 'ta' ? 'விளைச்சல் ஆபத்து குறியீடு' : 'Yield Risk Index'}
          </p>
          <p className="text-xs text-gray-500">
            {lang === 'ta' ? 'ML அனுமானத்தைப் பயன்படுத்தி சாத்தியமான பயிர் விளைச்சல் ஆபத்துகளைக் கண்டறியவும்' : 'Detect potential crop yield risks using ML inference'}
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border">
          <p className="font-semibold">
            🌦 {lang === 'ta' ? 'வானிலை ஒருங்கிணைப்பு' : 'Weather Integration'}
          </p>
          <p className="text-xs text-gray-500">
            {lang === 'ta' ? 'GPS-அடிப்படையிலான நேரடி வானிலை முன்னறிவிப்பு' : 'GPS-based live weather forecasting'}
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border">
          <p className="font-semibold">
            🌱 {lang === 'ta' ? 'பயிர் பரிந்துரை' : 'Crop Recommendation'}
          </p>
          <p className="text-xs text-gray-500">
            {lang === 'ta' ? 'உங்கள் மண்ணுக்கு சிறந்த பயிரை AI பரிந்துரைக்கிறது' : 'AI suggests best crop for your soil'}
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border">
          <p className="font-semibold">
            📊 {lang === 'ta' ? 'லாபகர குறியீடு' : 'Profitability Index'}
          </p>
          <p className="text-xs text-gray-500">
            {lang === 'ta' ? 'சந்தை-உந்துதல் பொருளாதார நுண்ணறிவு' : 'Market-driven economic insight'}
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border">
          <p className="font-semibold">
            📡 {lang === 'ta' ? 'NDVI ஆரோக்கிய மதிப்பெண்' : 'NDVI Health Score'}
          </p>
          <p className="text-xs text-gray-500">
            {lang === 'ta' ? 'செயற்கைக்கோள் தாவர குறியீடு மதிப்பீடு' : 'Satellite vegetation index estimation'}
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border">
          <p className="font-semibold">
            💧 {lang === 'ta' ? 'மண் ஈரப்பதம் மதிப்பீடு' : 'Soil Moisture Estimation'}
          </p>
          <p className="text-xs text-gray-500">
            {lang === 'ta' ? 'AI நீர்ப்பாசன ஆலோசனை' : 'AI irrigation advisory'}
          </p>
        </div>

      </div>

      {/* DEMO GUIDE */}
      <div className="mt-6 bg-white rounded-xl p-4 shadow-sm border">

        <h3 className="font-semibold text-lg">
          {lang === 'ta' ? 'டெமோ படிகள்' : 'Demo Steps'}
        </h3>

        <ul className="list-disc pl-4 text-sm mt-2 text-gray-600">
          <li>{lang === 'ta' ? 'மாவட்டத்தை தானாக கண்டறிய GPS ஐ அனுமதிக்கவும்' : 'Allow GPS to auto-detect district'}</li>
          <li>{lang === 'ta' ? 'நேரடி வானிலை பெறுதல்' : 'Realtime weather fetch'}</li>
          <li>{lang === 'ta' ? 'பயிர், பருவம் மற்றும் மண்ணைத் தேர்ந்தெடுக்கவும்' : 'Select crop, season & soil'}</li>
          <li>{lang === 'ta' ? 'கணிக்கவும் → AI ஆலோசனையைக் கிளிக் செய்யவும்' : 'Click Predict → AI Advisory'}</li>
          <li>{lang === 'ta' ? 'விவசாயி DSS அறிக்கையைப் பதிவிறக்கவும்' : 'Download Farmer DSS Report'}</li>
        </ul>

      </div>

      {/* QUICK STATS */}
      <div className="mt-6 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-4 border">
        <h3 className="font-semibold text-lg mb-3">
          {lang === 'ta' ? '🚀 அமைப்பு புள்ளிவிவரங்கள்' : '🚀 System Statistics'}
        </h3>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">
              {lang === 'ta' ? 'ஆதரிக்கப்படும் பயிர்கள்:' : 'Supported Crops:'}
            </span>
            <span className="font-semibold ml-2">16+</span>
          </div>
          <div>
            <span className="text-gray-600">
              {lang === 'ta' ? 'கணிப்பு துல்லியம்:' : 'Prediction Accuracy:'}
            </span>
            <span className="font-semibold ml-2">92{t.percentage}</span>
          </div>
          <div>
            <span className="text-gray-600">
              {lang === 'ta' ? 'மொழி ஆதரவு:' : 'Language Support:'}
            </span>
            <span className="font-semibold ml-2">
              {lang === 'ta' ? 'தமிழ், ஆங்கிலம்' : 'Tamil, English'}
            </span>
          </div>
          <div>
            <span className="text-gray-600">
              {lang === 'ta' ? 'மொபைல் தயார்:' : 'Mobile Ready:'}
            </span>
            <span className="font-semibold ml-2">
              {lang === 'ta' ? 'ஆம்' : 'Yes'} ✅
            </span>
          </div>
        </div>
      </div>

    </div>
  );
}