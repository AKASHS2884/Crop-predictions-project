import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

export default function YieldMeter() {

  const aiScore = 78;

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border text-center">
      <p className="text-xs text-gray-500">
        AI Yield Confidence
      </p>

      <div className="w-24 h-24 mx-auto mt-2">
        <CircularProgressbar
          value={aiScore}
          text={`${aiScore}%`}
        />
      </div>
    </div>
  );
}