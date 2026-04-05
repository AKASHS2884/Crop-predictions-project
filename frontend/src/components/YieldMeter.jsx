import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { useEffect, useState } from "react";

export default function YieldMeter({ t, lang }) {
  const [score, setScore] = useState(0);
  const [label, setLabel] = useState("No data yet");

  useEffect(() => {
    const history = JSON.parse(localStorage.getItem("cropPredictions") || "[]");
    if (history.length > 0) {
      const last = history[0];
      const suit = last?.current_crop_suitability?.suitability ?? 0;
      setScore(Math.round(suit));
      setLabel(last.crop || "Last crop");
    } else {
      setScore(0);
      setLabel(lang === "ta" ? "கணிப்பு இல்லை" : "No prediction yet");
    }
  }, [lang]);

  const color = score >= 80 ? "#16a34a" : score >= 55 ? "#d97706" : "#dc2626";

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border text-center">
      <p className="text-xs text-gray-500 mb-2">
        {lang === "ta" ? "கடைசி பொருத்தம்" : "Last Suitability"}
      </p>
      <div className="w-20 h-20 mx-auto">
        <CircularProgressbar
          value={score}
          text={`${score}%`}
          styles={buildStyles({
            textSize: "22px",
            pathColor: color,
            textColor: color,
            trailColor: "#f3f4f6",
          })}
        />
      </div>
      <p className="text-xs text-gray-500 mt-2 truncate">{label}</p>
    </div>
  );
}
