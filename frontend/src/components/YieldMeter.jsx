import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

export default function YieldMeter({ t, lang }) {

  const aiScore = 78;

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border text-center">
      <p className="text-xs text-gray-500">
        {lang === 'ta' ? 'AI விளைச்சல் நம்பிக்கை' : 'AI Yield Confidence'}
      </p>

      <div className="w-24 h-24 mx-auto mt-2">
        <CircularProgressbar
          value={aiScore}
          text={`${aiScore}${t?.percentage || '%'}`}
        />
      </div>
    </div>
  );
}