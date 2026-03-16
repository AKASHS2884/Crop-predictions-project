import { useEffect, useState } from "react";
import { api } from "../api";
import WeatherWidget from "../components/WeatherWidget";
import PredictionCard from "../components/PredictionCard";
import SuitabilityAnalysis from "../components/SuitabilityAnalysis";
import { 
  MobileCard, 
  MobileButton, 
  MobileInput, 
  MobileLoadingSpinner,
  MobileAlert 
} from "../components/MobileOptimized";
import {
LineChart,
Line,
XAxis,
YAxis,
Tooltip,
ResponsiveContainer,
CartesianGrid,
ReferenceLine
} from "recharts";
import { TN_DISTRICTS } from "../data/districts";

export default function Predict({ t = {}, lang = 'en', isMobile, weather: propWeather }) {

// Fallback translations to prevent white screen
const safeT = {
  crop: t?.crop || 'Crop',
  season: t?.season || 'Season', 
  soil: t?.soil || 'Soil Type',
  area: t?.area || 'Area (Hectares)',
  district: t?.district || 'District',
  predictBtn: t?.predictBtn || 'Predict Yield',
  predicting: t?.predicting || 'Analyzing...',
  predictTitle: t?.predictTitle || 'Crop Yield Prediction',
  inputForm: t?.inputForm || 'Enter Farm Details',
  predictedYield: t?.predictedYield || 'Predicted Yield',
  tonsPerHectare: t?.tonsPerHectare || 'T/Ha',
  rupees: t?.rupees || '₹',
  celsius: t?.celsius || '°C',
  millimeters: t?.millimeters || 'mm',
  percentage: t?.percentage || '%',
  crops: t?.crops || {},
  seasons: t?.seasons || {},
  soilTypes: t?.soilTypes || {},
  districts: t?.districts || {}
};

// Get translated options
const getCrops = () => {
  const cropKeys = ["rice","maize","sugarcane","cotton","groundnut","banana",
    "coconut","ragi","chilli","turmeric","blackGram","greenGram","millets","sesame","sunflower","soybean"];
  return cropKeys.map(key => ({
    key: key,
    value: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
    label: t.crops?.[key] || key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')
  }));
};

const getSeasons = () => {
  return [
    { key: "kharif", value: "Kharif", label: t.seasons?.kharif || "Kharif" },
    { key: "rabi", value: "Rabi", label: t.seasons?.rabi || "Rabi" },
    { key: "summer", value: "Summer", label: t.seasons?.summer || "Summer" }
  ];
};

const getSoilTypes = () => {
  return [
    { key: "red", value: "Red", label: t.soilTypes?.red || "Red Soil" },
    { key: "black", value: "Black", label: t.soilTypes?.black || "Black Soil" },
    { key: "alluvial", value: "Alluvial", label: t.soilTypes?.alluvial || "Alluvial" },
    { key: "clay", value: "Clay", label: t.soilTypes?.clay || "Clay" },
    { key: "loamy", value: "Loamy", label: t.soilTypes?.loamy || "Loamy" }
  ];
};

const getDistricts = () => {
  return TN_DISTRICTS.map(district => ({
    key: district.toLowerCase(),
    value: district,
    label: t.districts?.[district.toLowerCase()] || district
  }));
};

const [form,setForm]=useState({
crop:"Rice",
season:"Kharif",
soil:"Red",
area:1,
district:"Coimbatore",
});

const [weather,setWeather]=useState(propWeather || null);
const [result,setResult]=useState(null);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

const historical=[
{name:"2020",yield:3.2},
{name:"2021",yield:3.6},
{name:"2022",yield:3.4},
{name:"2023",yield:3.7},
{name:"2024",yield:3.8}
];

useEffect(() => {
  if (propWeather) {
    setWeather(propWeather);
  }
}, [propWeather]);

useEffect(()=>{

if (!weather) {
  navigator.geolocation.getCurrentPosition(

  async(pos)=>{

  const lat=pos.coords.latitude;
  const lon=pos.coords.longitude;

  const key=import.meta.env.VITE_OPENWEATHER_KEY;

  if(!key){
  setWeather({district:"Coimbatore",temperature:30,rainfall:0});
  return;
  }

  const url=`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${key}&units=metric`;

  const res=await fetch(url);
  const data=await res.json();

  const temperature=data?.main?.temp ?? 30;
  const rainfall=data?.rain ? data.rain["1h"] || 0 : 0;
  const districtGuess=data?.name || "Coimbatore";

  setWeather({
  district:districtGuess,
  temperature,
  rainfall
  });

  setForm(prev=>({...prev,district:districtGuess}));

  },

  ()=>{
  setWeather({district:"Coimbatore",temperature:30,rainfall:0});
  }

  );
}

},[weather]);

const savePredictionToHistory = (predictionData) => {
  const historyItem = {
    ...predictionData,
    ...form,
    rainfall: weather?.rainfall ?? 0,
    temperature: weather?.temperature ?? 30,
    timestamp: new Date().toISOString()
  };
  
  const existingHistory = JSON.parse(localStorage.getItem('cropPredictions') || '[]');
  const updatedHistory = [historyItem, ...existingHistory].slice(0, 50);
  localStorage.setItem('cropPredictions', JSON.stringify(updatedHistory));
};

const handlePredict=async()=>{

setResult(null);
setLoading(true);
setError(null);

const payload={
district:form.district,
crop:form.crop,
season:form.season,
soil:form.soil,
area:Number(form.area),
rainfall:weather?.rainfall ?? 0,
temperature:weather?.temperature ?? 30,
};

try {
  const res=await api.post("/predict",payload);
  setResult(res.data);
  savePredictionToHistory(res.data);
} catch (err) {
  const errorMsg = lang === 'ta' 
    ? 'கணிப்பு பெற முடியவில்லை. உங்கள் இணைப்பைச் சரிபார்த்து மீண்டும் முயற்சிக்கவும்.'
    : 'Failed to get prediction. Please check your connection and try again.';
  setError(errorMsg);
  console.error('Prediction error:', err);
} finally {
  setLoading(false);
}

};

const chartData=result
? [...historical,{name: lang === 'ta' ? "2025 AI" : "2025 AI",yield:result.predicted_yield_tph}]
: historical;

const estimatedRevenue=result
? (
result.predicted_yield_tph *
form.area *
(result.market_price_inr_per_quintal / 10)
).toFixed(0)
: null;

if (isMobile) {
  return (
    <div className="space-y-4">
      {error && (
        <MobileAlert 
          type="error" 
          message={error} 
          onClose={() => setError(null)} 
        />
      )}

      {/* Weather Status */}
      {weather && (
        <MobileCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-800">
                🌤️ {lang === 'ta' ? 'தற்போதைய நிலைமைகள்' : 'Current Conditions'}
              </h3>
              <p className="text-sm text-gray-600">{weather.district || form.district}</p>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="text-center">
                <div className="text-lg">🌡️</div>
                <div className="font-semibold">{weather.temperature}{t.celsius}</div>
              </div>
              <div className="text-center">
                <div className="text-lg">🌧️</div>
                <div className="font-semibold">{weather.rainfall}{t.millimeters}</div>
              </div>
            </div>
          </div>
        </MobileCard>
      )}

      {/* Input Form */}
      <MobileCard className="p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          📋 {lang === 'ta' ? 'பண்ணை அளவுருகள்' : 'Farm Parameters'}
        </h3>
        
        <div className="space-y-4">
          <MobileInput
            label={t.crop}
            type="select"
            value={form.crop}
            onChange={(e) => setForm({...form, crop: e.target.value})}
            options={getCrops().map(c => c.value)}
          />

          <div className="grid grid-cols-2 gap-3">
            <MobileInput
              label={t.season}
              type="select"
              value={form.season}
              onChange={(e) => setForm({...form, season: e.target.value})}
              options={getSeasons().map(s => s.value)}
            />

            <MobileInput
              label={t.soil}
              type="select"
              value={form.soil}
              onChange={(e) => setForm({...form, soil: e.target.value})}
              options={getSoilTypes().map(s => s.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <MobileInput
              label={t.area}
              type="number"
              value={form.area}
              onChange={(e) => setForm({...form, area: e.target.value})}
              placeholder="1.0"
            />

            <MobileInput
              label={t.district}
              type="select"
              value={form.district}
              onChange={(e) => setForm({...form, district: e.target.value})}
              options={TN_DISTRICTS}
            />
          </div>
        </div>

        <div className="mt-6">
          <MobileButton 
            onClick={handlePredict} 
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                {t.predicting}
              </>
            ) : (
              <>🤖 {lang === 'ta' ? 'AI கணிப்பு பெறுங்கள்' : 'Get AI Prediction'}</>
            )}
          </MobileButton>
        </div>
      </MobileCard>

      {/* Loading State */}
      {loading && (
        <MobileCard>
          <MobileLoadingSpinner message={lang === 'ta' ? 'பயிர் நிலைமைகளை பகுப்பாய்வு செய்கிறது...' : 'Analyzing crop conditions...'} />
        </MobileCard>
      )}

      {/* Results */}
      {result && (
        <>
          <PredictionCard result={result} t={t} lang={lang} />
          
          <SuitabilityAnalysis 
            result={result} 
            t={t}
            lang={lang}
            formData={{
              ...form,
              rainfall: weather?.rainfall ?? 0,
              temperature: weather?.temperature ?? 30
            }} 
          />

          {/* Mobile Chart */}
          <MobileCard className="p-4">
            <h3 className="font-semibold text-lg mb-2">
              📊 {lang === 'ta' ? 'விளைச்சல் முன்னறிவிப்பு' : 'Yield Forecast'}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              {lang === 'ta' ? 'வரலாற்று Vs AI கணிக்கப்பட்ட விளைச்சல்' : 'Historical vs AI predicted yield'}
            </p>
            
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3"/>
                  <XAxis dataKey="name" fontSize={12}/>
                  <YAxis fontSize={12}/>
                  <Tooltip/>
                  <ReferenceLine
                    y={4}
                    stroke="#94a3b8"
                    strokeDasharray="3 3"
                    label={lang === 'ta' ? 'மாநில சராசரி' : 'State Avg'}
                  />
                  <Line
                    type="monotone"
                    dataKey="yield"
                    stroke="#16a34a"
                    strokeWidth={2}
                    dot={{r:3}}
                    activeDot={{r:5}}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="bg-green-50 p-3 rounded-lg border">
                <p className="text-xs text-gray-500">{t.predictedYield}</p>
                <p className="text-lg font-bold text-green-700">
                  {result.predicted_yield_tph} {t.tonsPerHectare}
                </p>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg border">
                <p className="text-xs text-gray-500">
                  {lang === 'ta' ? 'எதிர்பார்க்கப்படும் வருமானம்' : 'Estimated Revenue'}
                </p>
                <p className="text-lg font-bold text-blue-700">
                  {t.rupees} {estimatedRevenue}
                </p>
              </div>
            </div>
          </MobileCard>
        </>
      )}
    </div>
  );
}

// Desktop version with comprehensive translations
return(

<div className="p-4 max-w-3xl mx-auto space-y-4">

{/* HEADER */}
<div className="bg-gradient-to-r from-green-600 to-emerald-500 text-white p-5 rounded-2xl shadow-lg">

<h2 className="text-xl font-bold">
🌾 {t.predictTitle}
</h2>

<p className="text-xs opacity-90 mt-1">
{lang === 'ta' ? 'நேரடி ML பயிர் முடிவு ஆதரவு அமைப்பு' : 'Real-Time ML Crop Decision Support System'}
</p>

<div className="flex gap-2 mt-3 flex-wrap text-xs">

<span className="bg-white text-green-700 px-3 py-1 rounded-full">
{lang === 'ta' ? 'ML மாதிரி' : 'ML Model'}
</span>

<span className="bg-white text-green-700 px-3 py-1 rounded-full">
{lang === 'ta' ? 'வானிலை ஒருங்கிணைக்கப்பட்டது' : 'Weather Integrated'}
</span>

<span className="bg-white text-green-700 px-3 py-1 rounded-full">
{lang === 'ta' ? 'மாவட்ட கணிப்பு' : 'District Prediction'}
</span>

<span className="bg-white text-green-700 px-3 py-1 rounded-full">
{lang === 'ta' ? 'ஆலோசனை இயந்திரம்' : 'Advisory Engine'}
</span>

</div>

</div>

{/* WEATHER */}
<WeatherWidget weather={weather} t={t} lang={lang}/>

{/* INPUT FORM */}
<div className="bg-white rounded-xl p-5 shadow-md border space-y-4">

<h3 className="font-semibold text-lg">
📋 {t.inputForm}
</h3>

{error && (
  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
    {error}
  </div>
)}

<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

<div>
<label className="text-sm font-medium">{t.crop}</label>
<select
className="w-full border rounded-lg p-2 mt-1"
value={form.crop}
onChange={(e)=>setForm({...form,crop:e.target.value})}
>
{getCrops().map(c=><option key={c.value} value={c.value}>{c.label}</option>)}
</select>
</div>

<div>
<label className="text-sm font-medium">{t.season}</label>
<select
className="w-full border rounded-lg p-2 mt-1"
value={form.season}
onChange={(e)=>setForm({...form,season:e.target.value})}
>
{getSeasons().map(s=><option key={s.value} value={s.value}>{s.label}</option>)}
</select>
</div>

<div>
<label className="text-sm font-medium">{t.soil}</label>
<select
className="w-full border rounded-lg p-2 mt-1"
value={form.soil}
onChange={(e)=>setForm({...form,soil:e.target.value})}
>
{getSoilTypes().map(s=><option key={s.value} value={s.value}>{s.label}</option>)}
</select>
</div>

<div>
<label className="text-sm font-medium">{t.area}</label>
<input
type="number"
className="w-full border rounded-lg p-2 mt-1"
value={form.area}
onChange={(e)=>setForm({...form,area:e.target.value})}
placeholder="1.0"
/>
</div>

<div className="sm:col-span-2">
<label className="text-sm font-medium">{t.district}</label>
<select
className="w-full border rounded-lg p-2 mt-1"
value={form.district}
onChange={(e)=>setForm({...form,district:e.target.value})}
>
{getDistricts().map(d=><option key={d.value} value={d.value}>{d.label}</option>)}
</select>
</div>

</div>

<button
onClick={handlePredict}
className="w-full bg-gradient-to-r from-green-600 to-emerald-500 text-white rounded-lg py-3 font-semibold shadow hover:opacity-90 transition disabled:opacity-50"
disabled={loading}
>
{loading ? t.predicting : `🤖 ${t.predictBtn}`}
</button>

</div>

{/* RESULT */}
<PredictionCard result={result} t={t} lang={lang}/>

{/* SUITABILITY ANALYSIS */}
<SuitabilityAnalysis 
  result={result} 
  t={t}
  lang={lang}
  formData={{
    ...form,
    rainfall: weather?.rainfall ?? 0,
    temperature: weather?.temperature ?? 30
  }} 
/>

{/* AI INSIGHTS */}
{result && (

<div className="bg-white rounded-xl p-4 shadow-sm border">

<h3 className="font-semibold text-lg">
🧠 {lang === 'ta' ? 'AI நுண்ணறிவுகள்' : 'AI Insights'}
</h3>

<ul className="text-sm text-gray-600 mt-2 space-y-1">

<li>• {lang === 'ta' ? 'மழைப்பொழிவு நிலைமைகள் சிறந்ததை விட சற்று குறைவாக உள்ளன' : 'Rainfall conditions slightly below optimal'}</li>

<li>• {lang === 'ta' ? 'மண் வளம் கணிக்கப்பட்ட விளைச்சலை பாதிக்கிறது' : 'Soil fertility affects predicted yield'}</li>

<li>• {lang === 'ta' ? 'சமச்சீர் உரம் உற்பத்தித்திறனை அதிகரிக்கும்' : 'Balanced fertilizer can increase productivity'}</li>

<li>• {lang === 'ta' ? 'ஒவ்வொரு 4-5 நாட்களுக்கும் நீர்ப்பாசன அட்டவணை பரிந்துரைக்கப்படுகிறது' : 'Irrigation scheduling recommended every 4-5 days'}</li>

</ul>

</div>

)}

{/* CHART */}
<div className="bg-white rounded-xl p-5 shadow-md border space-y-4">

<h3 className="font-semibold text-lg flex items-center gap-2">
📊 {lang === 'ta' ? 'AI விளைச்சல் முன்னறிவிப்பு பகுப்பாய்வு' : 'AI Yield Forecast Analysis'}
</h3>

<p className="text-xs text-gray-500">
{lang === 'ta' ? 'வரலாற்று பயிர் விளைச்சல் Vs AI கணிக்கப்பட்ட விளைச்சல்' : 'Historical crop yield vs AI predicted yield'}
</p>

<div className="h-64">

<ResponsiveContainer width="100%" height="100%">

<LineChart data={chartData}>

<CartesianGrid strokeDasharray="3 3"/>

<XAxis dataKey="name"/>

<YAxis/>

<Tooltip/>

<ReferenceLine
y={4}
stroke="#94a3b8"
strokeDasharray="3 3"
label={lang === 'ta' ? 'மாநில சராசரி' : 'State Avg'}
/>

<Line
type="monotone"
dataKey="yield"
stroke="#16a34a"
strokeWidth={3}
dot={{r:4}}
activeDot={{r:6}}
/>

</LineChart>

</ResponsiveContainer>

</div>

{result && (

<div className="grid grid-cols-2 gap-3">

<div className="bg-green-50 p-3 rounded-lg border">

<p className="text-xs text-gray-500">
{t.predictedYield}
</p>

<p className="text-lg font-bold text-green-700">
{result.predicted_yield_tph} {t.tonsPerHectare}
</p>

</div>

<div className="bg-blue-50 p-3 rounded-lg border">

<p className="text-xs text-gray-500">
{lang === 'ta' ? 'எதிர்பார்க்கப்படும் வருமானம்' : 'Estimated Revenue'}
</p>

<p className="text-lg font-bold text-blue-700">
{t.rupees} {estimatedRevenue}
</p>

</div>

</div>

)}

</div>

</div>

);

}