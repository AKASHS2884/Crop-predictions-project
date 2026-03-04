import { useEffect, useState } from "react";
import { api } from "../api";
import WeatherWidget from "../components/WeatherWidget";
import PredictionCard from "../components/PredictionCard";
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

const crops = [
"Rice","Maize","Sugarcane","Cotton","Groundnut","Banana",
"Coconut","Ragi","Chilli","Turmeric","Black Gram",
"Green Gram","Paddy","Millets","Jowar","Bajra",
"Sesame","Sunflower","Soybean","Cashew","Mango"
];

const seasons = ["Kharif","Rabi","Summer"];

const soilTypes=["Red","Black","Alluvial","Clay","Loamy"];

export default function Predict({ t }) {

const [form,setForm]=useState({
crop:"Rice",
season:"Kharif",
soil:"Red",
area:1,
district:"Coimbatore",
});

const [weather,setWeather]=useState(null);
const [result,setResult]=useState(null);

const historical=[
{name:"2020",yield:3.2},
{name:"2021",yield:3.6},
{name:"2022",yield:3.4},
{name:"2023",yield:3.7},
{name:"2024",yield:3.8}
];

useEffect(()=>{

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

},[]);

const handlePredict=async()=>{

setResult(null);

const payload={
district:form.district,
crop:form.crop,
season:form.season,
soil:form.soil,
area:Number(form.area),
rainfall:weather?.rainfall ?? 0,
temperature:weather?.temperature ?? 30,
};

const res=await api.post("/predict",payload);

setResult(res.data);

};

const chartData=result
? [...historical,{name:"2025 AI",yield:result.predicted_yield_tph}]
: historical;

const estimatedRevenue=result
? (
result.predicted_yield_tph *
form.area *
(result.market_price_inr_per_quintal / 10)
).toFixed(0)
: null;

return(

<div className="p-4 max-w-3xl mx-auto space-y-4">

{/* HEADER */}

<div className="bg-gradient-to-r from-green-600 to-emerald-500 text-white p-5 rounded-2xl shadow-lg">

<h2 className="text-xl font-bold">
🌾 AI Crop Yield Prediction
</h2>

<p className="text-xs opacity-90 mt-1">
Real-Time ML Crop Decision Support System
</p>

<div className="flex gap-2 mt-3 flex-wrap text-xs">

<span className="bg-white text-green-700 px-3 py-1 rounded-full">
ML Model
</span>

<span className="bg-white text-green-700 px-3 py-1 rounded-full">
Weather Integrated
</span>

<span className="bg-white text-green-700 px-3 py-1 rounded-full">
District Prediction
</span>

<span className="bg-white text-green-700 px-3 py-1 rounded-full">
Advisory Engine
</span>

</div>

</div>

{/* WEATHER */}

<WeatherWidget weather={weather} t={t}/>

{/* INPUT FORM */}

<div className="bg-white rounded-xl p-5 shadow-md border space-y-4">

<h3 className="font-semibold text-lg">
📋 Farm Input Parameters
</h3>

<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

<div>

<label className="text-sm">{t.crop}</label>

<select
className="w-full border rounded-lg p-2"
value={form.crop}
onChange={(e)=>setForm({...form,crop:e.target.value})}
>
{crops.map(c=><option key={c}>{c}</option>)}
</select>

</div>

<div>

<label className="text-sm">{t.season}</label>

<select
className="w-full border rounded-lg p-2"
value={form.season}
onChange={(e)=>setForm({...form,season:e.target.value})}
>
{seasons.map(s=><option key={s}>{s}</option>)}
</select>

</div>

<div>

<label className="text-sm">Soil Type</label>

<select
className="w-full border rounded-lg p-2"
value={form.soil}
onChange={(e)=>setForm({...form,soil:e.target.value})}
>
{soilTypes.map(s=><option key={s}>{s}</option>)}
</select>

</div>

<div>

<label className="text-sm">{t.area}</label>

<input
type="number"
className="w-full border rounded-lg p-2"
value={form.area}
onChange={(e)=>setForm({...form,area:e.target.value})}
/>

</div>

<div className="sm:col-span-2">

<label className="text-sm">{t.district}</label>

<select
className="w-full border rounded-lg p-2"
value={form.district}
onChange={(e)=>setForm({...form,district:e.target.value})}
>
{TN_DISTRICTS.map(d=><option key={d}>{d}</option>)}
</select>

</div>

</div>

<button
onClick={handlePredict}
className="w-full bg-gradient-to-r from-green-600 to-emerald-500 text-white rounded-lg py-3 font-semibold shadow hover:opacity-90 transition"
>
🤖 Run AI Prediction
</button>

</div>

{/* RESULT */}

<PredictionCard result={result} t={t}/>

{/* AI INSIGHTS */}

{result && (

<div className="bg-white rounded-xl p-4 shadow-sm border">

<h3 className="font-semibold text-lg">
🧠 AI Insights
</h3>

<ul className="text-sm text-gray-600 mt-2 space-y-1">

<li>• Rainfall conditions slightly below optimal</li>

<li>• Soil fertility affects predicted yield</li>

<li>• Balanced fertilizer can increase productivity</li>

<li>• Irrigation scheduling recommended every 4-5 days</li>

</ul>

</div>

)}

{/* CHART */}

<div className="bg-white rounded-xl p-5 shadow-md border space-y-4">

<h3 className="font-semibold text-lg flex items-center gap-2">
📊 AI Yield Forecast Analysis
</h3>

<p className="text-xs text-gray-500">
Historical crop yield vs AI predicted yield
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
label="State Avg"
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
AI Predicted Yield
</p>

<p className="text-lg font-bold text-green-700">
{result.predicted_yield_tph} T/Ha
</p>

</div>

<div className="bg-blue-50 p-3 rounded-lg border">

<p className="text-xs text-gray-500">
Estimated Revenue
</p>

<p className="text-lg font-bold text-blue-700">
₹ {estimatedRevenue}
</p>

</div>

</div>

)}

</div>

</div>

);

}