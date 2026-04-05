export default function WeatherWidget({ weather, t, lang }) {
  if (!weather) return (
    <div className="bg-gray-50 border border-dashed border-gray-200 rounded-xl p-4 text-center text-sm text-gray-400">
      📡 {lang === "ta" ? "வானிலை தரவு கிடைக்கவில்லை" : "Weather data unavailable — allow GPS for live data"}
    </div>
  );

  const temp = weather.temperature ?? 30;
  const rain = weather.rainfall ?? 0;
  const hum  = weather.humidity;

  // Dynamic weather condition
  const getCondition = () => {
    if (rain > 10) return { icon:"⛈️", label:"Rainy",   color:"text-blue-600",   bg:"bg-blue-50"   };
    if (rain > 2)  return { icon:"🌦️", label:"Drizzle", color:"text-cyan-600",   bg:"bg-cyan-50"   };
    if (temp > 38) return { icon:"🔥", label:"Hot",     color:"text-red-600",    bg:"bg-red-50"    };
    if (temp > 32) return { icon:"☀️", label:"Sunny",   color:"text-amber-600",  bg:"bg-amber-50"  };
    if (temp < 20) return { icon:"❄️", label:"Cool",    color:"text-indigo-600", bg:"bg-indigo-50" };
    return              { icon:"🌤️", label:"Pleasant", color:"text-green-600",  bg:"bg-green-50"  };
  };
  const cond = getCondition();

  // Farming advice based on conditions
  const getAdvice = () => {
    if (rain > 15) return "Heavy rain — avoid field operations today";
    if (rain > 5)  return "Light rain — good for germination";
    if (temp > 38) return "Heat stress risk — irrigate in evening";
    if (temp < 20) return "Cool weather — monitor seedling growth";
    if (rain === 0 && temp > 30) return "Dry & hot — irrigation recommended";
    return "Favourable conditions for field work";
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className={`px-4 py-3 ${cond.bg} flex items-center justify-between`}>
        <div className="flex items-center gap-2">
          <span className="text-2xl">{cond.icon}</span>
          <div>
            <p className={`text-sm font-bold ${cond.color}`}>{cond.label}</p>
            <p className="text-xs text-gray-500">
              {lang === "ta" ? "நேரடி வானிலை" : "Live Weather"}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-gray-800">{temp}°C</p>
          <p className="text-xs text-gray-400">Temperature</p>
        </div>
      </div>

      {/* Metrics */}
      <div className="px-4 py-3 grid grid-cols-3 gap-3">
        <div className="text-center">
          <div className="text-xl">🌧️</div>
          <p className="text-sm font-bold text-gray-700">{rain} mm</p>
          <p className="text-xs text-gray-400">Rainfall</p>
        </div>
        <div className="text-center">
          <div className="text-xl">💧</div>
          <p className="text-sm font-bold text-gray-700">{hum ? `${hum}%` : "—"}</p>
          <p className="text-xs text-gray-400">Humidity</p>
        </div>
        <div className="text-center">
          <div className="text-xl">🌡️</div>
          <p className={`text-sm font-bold ${temp > 35 ? "text-red-600" : temp < 22 ? "text-blue-600" : "text-green-600"}`}>
            {temp > 35 ? "High" : temp < 22 ? "Low" : "Optimal"}
          </p>
          <p className="text-xs text-gray-400">Temp Status</p>
        </div>
      </div>

      {/* Farming advice */}
      <div className="px-4 pb-3">
        <div className="bg-gray-50 rounded-lg px-3 py-2 text-xs text-gray-600 flex items-center gap-2">
          <span>💡</span>
          <span>{getAdvice()}</span>
        </div>
      </div>
    </div>
  );
}
