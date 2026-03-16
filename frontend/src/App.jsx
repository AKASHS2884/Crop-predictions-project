import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Predict from "./pages/Predict";
import History from "./pages/History";
import Settings from "./pages/Settings";
import { LANG, getLanguageFromStorage, setLanguageToStorage } from "./components/i18n";
import { 
  MobileHeader, 
  MobileNavigation, 
  MobileBottomNav,
  MobileStatusBar 
} from "./components/MobileOptimized";

export default function App() {
  const [lang, setLang] = useState(getLanguageFromStorage());
  const [page, setPage] = useState("home");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [weather, setWeather] = useState(null);
  const [location, setLocation] = useState("Tamil Nadu");

  const t = LANG[lang];

  // Enhanced language setter with persistence
  const handleLanguageChange = (newLang) => {
    setLang(newLang);
    setLanguageToStorage(newLang);
  };

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Get user location and weather for mobile
  useEffect(() => {
    if (isMobile && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          
          try {
            // Try to get weather data
            const key = import.meta.env.VITE_OPENWEATHER_KEY;
            if (key) {
              const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${key}&units=metric`;
              const res = await fetch(url);
              const data = await res.json();
              
              setWeather({
                temperature: Math.round(data?.main?.temp ?? 30),
                rainfall: data?.rain ? Math.round(data.rain["1h"] || 0) : 0
              });
              setLocation(data?.name || "Tamil Nadu");
            }
          } catch (error) {
            console.log("Weather data unavailable");
          }
        },
        () => {
          setLocation("Tamil Nadu");
        }
      );
    }
  }, [isMobile]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
    setIsMenuOpen(false);
  };

  const renderPage = () => {
    switch (page) {
      case "predict":
        return <Predict t={t} lang={lang} isMobile={isMobile} weather={weather} />;
      case "history":
        return <History t={t} lang={lang} isMobile={isMobile} />;
      case "settings":
        return <Settings t={t} lang={lang} setLang={handleLanguageChange} isMobile={isMobile} />;
      default:
        return <Home t={t} lang={lang} isMobile={isMobile} />;
    }
  };

  if (isMobile) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <MobileHeader 
          title={t.appTitle} 
          onMenuToggle={() => setIsMenuOpen(true)} 
        />
        
        <MobileNavigation
          currentPage={page}
          onPageChange={handlePageChange}
          isOpen={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
          t={t}
          lang={lang}
        />

        <MobileStatusBar weather={weather} location={location} />

        <div className="min-h-screen">
          {renderPage()}
        </div>

        <MobileBottomNav 
          currentPage={page} 
          onPageChange={handlePageChange}
          t={t}
          lang={lang}
        />
      </div>
    );
  }

  // Desktop version (original)
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar lang={lang} setLang={handleLanguageChange} title={t.appTitle} />

      <div className="flex justify-center gap-3 mt-3">
        <button
          className={`px-4 py-2 rounded-lg border ${page === "home" ? "bg-black text-white" : "bg-white"}`}
          onClick={() => setPage("home")}
        >
          {t.home}
        </button>

        <button
          className={`px-4 py-2 rounded-lg border ${page === "predict" ? "bg-black text-white" : "bg-white"}`}
          onClick={() => setPage("predict")}
        >
          {t.predict}
        </button>
      </div>

      {renderPage()}
    </div>
  );
}
