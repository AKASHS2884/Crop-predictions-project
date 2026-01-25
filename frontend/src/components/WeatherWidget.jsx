import { CloudRain, Thermometer } from "lucide-react";

export default function WeatherWidget({ weather, t }) {
  if (!weather) return null;

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">{t.liveWeather}</h3>
        <span className="text-sm text-gray-500">{weather.district}</span>
      </div>

      <div className="mt-3 flex gap-6">
        <div className="flex items-center gap-2">
          <Thermometer className="w-5 h-5" />
          <span className="text-sm">{weather.temperature}°C</span>
        </div>

        <div className="flex items-center gap-2">
          <CloudRain className="w-5 h-5" />
          <span className="text-sm">{weather.rainfall} mm</span>
        </div>
      </div>
    </div>
  );
}
