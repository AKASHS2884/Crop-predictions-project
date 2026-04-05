import { useState, useEffect, useCallback } from "react";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Predict from "./pages/Predict";
import History from "./pages/History";
import Settings from "./pages/Settings";
import { LANG, getLanguageFromStorage, setLanguageToStorage } from "./components/i18n";
import {
  MobileHeader, MobileNavigation, MobileBottomNav, MobileStatusBar
} from "./components/MobileOptimized";

export default function App() {
  const [lang, setLang]           = useState(getLanguageFromStorage);
  const [page, setPage]           = useState("home");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile]   = useState(false);
  const [weather, setWeather]     = useState(null);
  const [location, setLocation]   = useState("Tamil Nadu");
  const [isOnline, setIsOnline]   = useState(navigator.onLine);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  const t = LANG[lang] || LANG.en;

  // ── Language ──────────────────────────────────────────────────────────────
  const handleLanguageChange = useCallback((l) => {
    setLang(l);
    setLanguageToStorage(l);
  }, []);

  // ── Mobile detection ──────────────────────────────────────────────────────
  useEffect(() => {
    const check = () =>
      setIsMobile(window.innerWidth < 768 ||
        /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // ── Online / offline ──────────────────────────────────────────────────────
  useEffect(() => {
    const on  = () => setIsOnline(true);
    const off = () => setIsOnline(false);
    window.addEventListener('online',  on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);

  // ── PWA install prompt ────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
      // Show banner only if not already installed
      if (!window.matchMedia('(display-mode: standalone)').matches) {
        setShowInstallBanner(true);
      }
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') setShowInstallBanner(false);
    setInstallPrompt(null);
  };

  // ── Weather (shared across pages) ─────────────────────────────────────────
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lon } = pos.coords;
        const key = import.meta.env.VITE_OPENWEATHER_KEY;
        if (!key) { setWeather({ temperature: 30, rainfall: 0 }); return; }
        try {
          const res  = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${key}&units=metric`);
          const data = await res.json();
          setWeather({
            temperature: Math.round(data?.main?.temp ?? 30),
            rainfall:    data?.rain ? Math.round(data.rain["1h"] || 0) : 0,
            humidity:    data?.main?.humidity ?? 60,
            description: data?.weather?.[0]?.description ?? ""
          });
          setLocation(data?.name || "Tamil Nadu");
        } catch (_) {
          setWeather({ temperature: 30, rainfall: 0 });
        }
      },
      () => setWeather({ temperature: 30, rainfall: 0 })
    );
  }, []);

  const handlePageChange = useCallback((p) => {
    setPage(p);
    setIsMenuOpen(false);
    // Haptic feedback on native
    try { window?.Capacitor?.Plugins?.Haptics?.impact({ style: 'light' }); } catch (_) {}
  }, []);

  const pageProps = { t, lang, isMobile, weather };

  const renderPage = () => {
    switch (page) {
      case "predict":  return <Predict  {...pageProps} />;
      case "history":  return <History  {...pageProps} />;
      case "settings": return <Settings {...pageProps} setLang={handleLanguageChange} />;
      default:         return <Home     {...pageProps} onNavigate={handlePageChange} />;
    }
  };

  // ── Offline banner ────────────────────────────────────────────────────────
  const OfflineBanner = () => !isOnline ? (
    <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-white text-center text-xs py-1.5 font-medium">
      📡 You're offline — predictions use cached data
    </div>
  ) : null;

  // ── Install banner ────────────────────────────────────────────────────────
  const InstallBanner = () => showInstallBanner ? (
    <div className="fixed bottom-20 left-3 right-3 z-40 bg-white rounded-2xl shadow-2xl border border-green-100 p-4 flex items-center gap-3">
      <div className="text-3xl">🌾</div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-800 text-sm">Install Smart Crop Advisor</p>
        <p className="text-xs text-gray-500">Add to home screen for the best experience</p>
      </div>
      <div className="flex gap-2 shrink-0">
        <button onClick={() => setShowInstallBanner(false)} className="text-xs text-gray-400 px-2 py-1">Later</button>
        <button onClick={handleInstall} className="text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg font-semibold">Install</button>
      </div>
    </div>
  ) : null;

  // ── Mobile layout ─────────────────────────────────────────────────────────
  if (isMobile) {
    return (
      <div className="min-h-screen bg-gray-50" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <OfflineBanner />
        <MobileHeader title={t.appTitle} onMenuToggle={() => setIsMenuOpen(true)} />
        <MobileNavigation
          currentPage={page} onPageChange={handlePageChange}
          isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)}
          t={t} lang={lang}
        />
        <MobileStatusBar weather={weather} location={location} />
        <div className="pb-20">
          {renderPage()}
        </div>
        <MobileBottomNav currentPage={page} onPageChange={handlePageChange} t={t} lang={lang} />
        <InstallBanner />
      </div>
    );
  }

  // ── Desktop layout ────────────────────────────────────────────────────────
  const navItems = [
    { id: "home",     label: t.home,     icon: "🏠" },
    { id: "predict",  label: t.predict,  icon: "🌾" },
    { id: "history",  label: t.history,  icon: "📊" },
    { id: "settings", label: t.settings, icon: "⚙️" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <OfflineBanner />
      <Navbar lang={lang} setLang={handleLanguageChange} title={t.appTitle} />
      <div className="flex justify-center gap-2 mt-4 px-4">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => setPage(item.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-150 border ${
              page === item.id
                ? "bg-green-600 text-white border-green-600 shadow-md"
                : "bg-white text-gray-600 border-gray-200 hover:border-green-300 hover:text-green-600"
            }`}
          >
            <span>{item.icon}</span>{item.label}
          </button>
        ))}
      </div>
      <div className="mt-4">{renderPage()}</div>
    </div>
  );
}
