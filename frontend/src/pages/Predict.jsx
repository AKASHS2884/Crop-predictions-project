import { useEffect, useState } from "react";
import { api } from "../api";
import WeatherWidget from "../components/WeatherWidget";
import PredictionCard from "../components/PredictionCard";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
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
    {name:"2020",value:3.2},
    {name:"2021",value:3.6},
    {name:"2022",value:3.4},
    {name:"2023",value:3.7},
    {name:"2024",value:3.8}
  ];

  useEffect(()=>{
    navigator.geolocation.getCurrentPosition(
      async(pos)=>{
        const lat=pos.coords.latitude;
        const lon=pos.coords.longitude;

        const key=import.meta.env.VITE_OPENWEATHER_KEY;
        if(!key) return;

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
  ? [...historical,{name:"2025",value:result.predicted_yield_tph}]
  : historical;

  return(
    <div className="p-4 max-w-2xl mx-auto space-y-4">

      <h1 className="text-2xl font-bold">{t.predictTitle}</h1>

      <WeatherWidget weather={weather} t={t}/>

      <div className="bg-white rounded-xl p-4 shadow-sm border space-y-3">
        <h3 className="font-semibold text-lg">{t.inputForm}</h3>

        <div className="grid grid-cols-2 gap-3">

          <div>
            <label className="text-sm">{t.crop}</label>
            <select className="w-full border rounded-lg p-2"
            value={form.crop}
            onChange={(e)=>setForm({...form,crop:e.target.value})}>
            {crops.map(c=><option key={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="text-sm">{t.season}</label>
            <select className="w-full border rounded-lg p-2"
            value={form.season}
            onChange={(e)=>setForm({...form,season:e.target.value})}>
            {seasons.map(s=><option key={s}>{s}</option>)}
            </select>
          </div>

          <div>
            <label className="text-sm">Soil Type</label>
            <select className="w-full border rounded-lg p-2"
            value={form.soil}
            onChange={(e)=>setForm({...form,soil:e.target.value})}>
            {soilTypes.map(s=><option key={s}>{s}</option>)}
            </select>
          </div>

          <div>
            <label className="text-sm">{t.area}</label>
            <input type="number"
            className="w-full border rounded-lg p-2"
            value={form.area}
            onChange={(e)=>setForm({...form,area:e.target.value})}/>
          </div>

          <div className="col-span-2">
            <label className="text-sm">{t.district}</label>
            <select
            className="w-full border rounded-lg p-2"
            value={form.district}
            onChange={(e)=>setForm({...form,district:e.target.value})}>
            {TN_DISTRICTS.map(d=><option key={d}>{d}</option>)}
            </select>
          </div>

        </div>

        <button
        onClick={handlePredict}
        className="w-full bg-black text-white rounded-lg py-2 font-semibold">
        {t.predictBtn}
        </button>

      </div>

      <PredictionCard result={result} t={t}/>

      <div className="bg-white rounded-xl p-4 shadow-sm border">
        <h3 className="font-semibold text-lg">{t.chartTitle}</h3>

        <div className="h-56 mt-3">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="name"/>
              <YAxis/>
              <Tooltip/>
              <Bar dataKey="value"/>
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>

    </div>
  );
}
