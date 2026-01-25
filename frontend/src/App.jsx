import { useState } from "react";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Predict from "./pages/Predict";
import { LANG } from "./components/i18n";

export default function App() {
  const [lang, setLang] = useState("en");
  const [page, setPage] = useState("home");

  const t = LANG[lang];

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar lang={lang} setLang={setLang} title={t.appTitle} />

      {/* simple mobile nav */}
      <div className="flex justify-center gap-3 mt-3">
        <button
          className={`px-4 py-2 rounded-lg border ${page === "home" ? "bg-black text-white" : "bg-white"}`}
          onClick={() => setPage("home")}
        >
          Home
        </button>

        <button
          className={`px-4 py-2 rounded-lg border ${page === "predict" ? "bg-black text-white" : "bg-white"}`}
          onClick={() => setPage("predict")}
        >
          Predict
        </button>
      </div>

      {page === "home" ? <Home t={t} /> : <Predict t={t} />}
    </div>
  );
}
