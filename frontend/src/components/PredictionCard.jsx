export default function PredictionCard({ result, t }) {
    if (!result) return null;
  
    return (
      <div className="bg-white rounded-xl p-4 shadow-sm border">
        <h3 className="font-semibold text-lg">✅ Result</h3>
  
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-gray-50">
            <p className="text-xs text-gray-500">{t.yield}</p>
            <p className="text-xl font-bold">{result.predicted_yield_tph} T/Ha</p>
          </div>
  
          <div className="p-3 rounded-lg bg-gray-50">
            <p className="text-xs text-gray-500">{t.marketPrice}</p>
            <p className="text-xl font-bold">₹{result.market_price_inr_per_quintal}</p>
            <p className="text-xs text-gray-400">per quintal</p>
          </div>
        </div>
      </div>
    );
  }
  