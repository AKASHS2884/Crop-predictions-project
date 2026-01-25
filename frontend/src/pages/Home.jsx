export default function Home({ t }) {
    return (
      <div className="p-4 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold">{t.homeTitle}</h1>
        <p className="mt-2 text-gray-600">{t.homeDesc}</p>
  
        <div className="mt-4 bg-white border rounded-xl p-4 shadow-sm">
          <p className="font-semibold"> Demo Steps</p>
          <ul className="list-disc pl-5 mt-2 text-sm text-gray-600">
            <li>Allow GPS to auto-detect district</li>
            <li>Weather fetch happens instantly</li>
            <li>Select crop, season & area</li>
            <li>Click Predict → Result + Chart</li>
          </ul>
        </div>
      </div>
    );
  }
  