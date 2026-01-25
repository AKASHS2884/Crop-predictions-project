export default function Navbar({ lang, setLang, title }) {
    return (
      <div className="p-3 flex items-center justify-between bg-white border-b sticky top-0 z-50">
        <h2 className="font-bold">{title}</h2>
  
        <button
          className="text-sm px-3 py-1 border rounded-lg"
          onClick={() => setLang(lang === "en" ? "ta" : "en")}
        >
          {lang === "en" ? "தமிழ்" : "English"}
        </button>
      </div>
    );
  }
  