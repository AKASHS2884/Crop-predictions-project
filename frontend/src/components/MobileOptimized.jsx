// Mobile-first components with native app feel

export function MobileHeader({ title, onMenuToggle }) {
  return (
    <div
      className="sticky top-0 z-50 bg-gradient-to-r from-green-600 to-emerald-500 text-white shadow-lg"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuToggle}
            className="p-2 rounded-xl bg-white/20 active:bg-white/40 transition-colors"
            aria-label="Menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xl">🌾</span>
            <h1 className="text-base font-bold tracking-tight">{title}</h1>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></span>
          <span className="text-xs font-medium opacity-90">Live</span>
        </div>
      </div>
    </div>
  );
}

export function MobileNavigation({ currentPage, onPageChange, isOpen, onClose, t, lang }) {
  const pages = [
    { id: 'home',     name: t?.home     || 'Home',     icon: '🏠', desc: 'Dashboard & overview' },
    { id: 'predict',  name: t?.predict  || 'Predict',  icon: '🌾', desc: 'AI yield prediction' },
    { id: 'history',  name: t?.history  || 'History',  icon: '📊', desc: 'Past predictions' },
    { id: 'settings', name: t?.settings || 'Settings', icon: '⚙️', desc: 'App preferences' },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute left-0 top-0 h-full w-72 bg-white shadow-2xl flex flex-col"
           style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        {/* Drawer header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-500 p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-xl">🌾</div>
              <div>
                <p className="text-white font-bold text-sm">Smart Crop Advisor</p>
                <p className="text-green-100 text-xs">AI Farming Assistant</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl bg-white/20 active:bg-white/40">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 p-4 space-y-1">
          {pages.map(p => (
            <button
              key={p.id}
              onClick={() => { onPageChange(p.id); onClose(); }}
              className={`w-full flex items-center gap-3 p-3.5 rounded-xl transition-all active:scale-95 ${
                currentPage === p.id
                  ? 'bg-green-50 border border-green-200'
                  : 'hover:bg-gray-50 border border-transparent'
              }`}
            >
              <span className="text-2xl">{p.icon}</span>
              <div className="text-left">
                <p className={`text-sm font-semibold ${currentPage === p.id ? 'text-green-700' : 'text-gray-700'}`}>
                  {p.name}
                </p>
                <p className="text-xs text-gray-400">{p.desc}</p>
              </div>
              {currentPage === p.id && (
                <div className="ml-auto w-1.5 h-6 bg-green-500 rounded-full" />
              )}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100">
          <p className="text-xs text-gray-400 text-center">Smart Crop Advisor v2.0 · 2025</p>
        </div>
      </div>
    </div>
  );
}

export function MobileBottomNav({ currentPage, onPageChange, t }) {
  const pages = [
    { id: 'home',     name: t?.home     || 'Home',     icon: '🏠' },
    { id: 'predict',  name: t?.predict  || 'Predict',  icon: '🌾' },
    { id: 'history',  name: t?.history  || 'History',  icon: '📊' },
    { id: 'settings', name: t?.settings || 'Settings', icon: '⚙️' },
  ];

  return (
    <div
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex justify-around px-2 pt-1 pb-1">
        {pages.map(p => (
          <button
            key={p.id}
            onClick={() => onPageChange(p.id)}
            className={`flex flex-col items-center py-2 px-3 rounded-xl transition-all active:scale-90 min-w-0 flex-1 ${
              currentPage === p.id ? 'text-green-600' : 'text-gray-400'
            }`}
          >
            <span className={`text-xl transition-transform ${currentPage === p.id ? 'scale-110' : ''}`}>
              {p.icon}
            </span>
            <span className={`text-xs mt-0.5 font-medium truncate ${
              currentPage === p.id ? 'text-green-600' : 'text-gray-400'
            }`}>
              {p.name}
            </span>
            {currentPage === p.id && (
              <div className="w-1 h-1 bg-green-500 rounded-full mt-0.5" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

export function MobileStatusBar({ weather, location }) {
  if (!weather && !location) return null;
  return (
    <div className="mx-3 mt-2 mb-1 bg-white border border-gray-100 rounded-xl px-4 py-2.5 shadow-sm">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-1.5 text-gray-600">
          <span className="text-green-500">📍</span>
          <span className="font-medium text-xs truncate max-w-[120px]">{location || "Tamil Nadu"}</span>
        </div>
        {weather && (
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span>🌡️ <strong className="text-gray-700">{weather.temperature}°C</strong></span>
            <span>🌧️ <strong className="text-gray-700">{weather.rainfall}mm</strong></span>
            {weather.humidity && <span>💧 <strong className="text-gray-700">{weather.humidity}%</strong></span>}
          </div>
        )}
      </div>
    </div>
  );
}

export function MobileCard({ children, className = "" }) {
  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 mx-3 mb-3 overflow-hidden ${className}`}>
      {children}
    </div>
  );
}

export function MobileButton({ children, onClick, variant = "primary", className = "", disabled = false }) {
  const base = "w-full py-3.5 px-4 rounded-xl font-semibold transition-all duration-150 flex items-center justify-center gap-2 active:scale-95 select-none";
  const variants = {
    primary:   "bg-gradient-to-r from-green-600 to-emerald-500 text-white shadow-md active:shadow-sm",
    secondary: "bg-gray-100 text-gray-700 active:bg-gray-200",
    danger:    "bg-red-500 text-white active:bg-red-600",
    outline:   "border-2 border-green-600 text-green-600 bg-white active:bg-green-50",
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {children}
    </button>
  );
}

export function MobileInput({ label, type = "text", value, onChange, placeholder, options = [] }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-semibold text-gray-700">{label}</label>
      {type === "select" ? (
        <select
          value={value}
          onChange={onChange}
          className="w-full p-3 border border-gray-200 rounded-xl bg-white text-gray-800 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none appearance-none"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '16px', paddingRight: '36px' }}
        >
          {options.map(o => (
            <option key={typeof o === 'object' ? o.value : o} value={typeof o === 'object' ? o.value : o}>
              {typeof o === 'object' ? o.label : o}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full p-3 border border-gray-200 rounded-xl bg-white text-gray-800 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
        />
      )}
    </div>
  );
}

export function MobileLoadingSpinner({ message = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6">
      <div className="relative w-14 h-14 mb-4">
        <div className="absolute inset-0 rounded-full border-4 border-green-100"></div>
        <div className="absolute inset-0 rounded-full border-4 border-green-500 border-t-transparent animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center text-lg">🌾</div>
      </div>
      <p className="text-gray-600 text-sm font-medium">{message}</p>
    </div>
  );
}

export function MobileAlert({ type = "info", message, onClose }) {
  const styles = {
    info:    { bg: "bg-blue-50 border-blue-200",   text: "text-blue-800",  icon: "ℹ️" },
    success: { bg: "bg-green-50 border-green-200", text: "text-green-800", icon: "✅" },
    warning: { bg: "bg-amber-50 border-amber-200", text: "text-amber-800", icon: "⚠️" },
    error:   { bg: "bg-red-50 border-red-200",     text: "text-red-800",   icon: "❌" },
  };
  const s = styles[type] || styles.info;
  return (
    <div className={`border rounded-xl p-3.5 mx-3 mb-3 ${s.bg}`}>
      <div className="flex items-start gap-2.5">
        <span className="text-base shrink-0 mt-0.5">{s.icon}</span>
        <p className={`text-sm font-medium flex-1 ${s.text}`}>{message}</p>
        {onClose && (
          <button onClick={onClose} className={`text-lg leading-none shrink-0 ${s.text} opacity-60`}>×</button>
        )}
      </div>
    </div>
  );
}
