import { useState } from "react";

// Mobile-optimized components for APK conversion
export function MobileHeader({ title, onMenuToggle }) {
  return (
    <div className="sticky top-0 z-50 bg-gradient-to-r from-green-600 to-emerald-500 text-white p-4 shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={onMenuToggle}
            className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-lg font-bold">{title}</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
          <span className="text-xs">Live</span>
        </div>
      </div>
    </div>
  );
}

export function MobileNavigation({ currentPage, onPageChange, isOpen, onClose, t, lang }) {
  const pages = [
    { id: 'home', name: t?.home || 'Home', icon: '🏠' },
    { id: 'predict', name: t?.predict || 'Predict', icon: '🌾' },
    { id: 'history', name: t?.history || 'History', icon: '📊' },
    { id: 'settings', name: t?.settings || 'Settings', icon: '⚙️' }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 lg:hidden">
      <div className="fixed inset-0 bg-black/50" onClick={onClose}></div>
      <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-xl transform transition-transform">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">
              {lang === 'ta' ? 'மெனு' : 'Menu'}
            </h2>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        <nav className="p-4">
          {pages.map(page => (
            <button
              key={page.id}
              onClick={() => {
                onPageChange(page.id);
                onClose();
              }}
              className={`w-full flex items-center gap-3 p-3 rounded-lg mb-2 transition-colors ${
                currentPage === page.id 
                  ? 'bg-green-100 text-green-700 font-semibold' 
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              <span className="text-xl">{page.icon}</span>
              <span>{page.name}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}

export function MobileBottomNav({ currentPage, onPageChange, t, lang }) {
  const pages = [
    { id: 'home', name: t?.home || 'Home', icon: '🏠' },
    { id: 'predict', name: t?.predict || 'Predict', icon: '🌾' },
    { id: 'history', name: t?.history || 'History', icon: '📊' },
    { id: 'settings', name: t?.settings || 'Settings', icon: '⚙️' }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-30">
      <div className="flex justify-around">
        {pages.map(page => (
          <button
            key={page.id}
            onClick={() => onPageChange(page.id)}
            className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
              currentPage === page.id 
                ? 'text-green-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <span className="text-xl mb-1">{page.icon}</span>
            <span className="text-xs font-medium">{page.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function MobileCard({ children, className = "" }) {
  return (
    <div className={`bg-white rounded-xl shadow-sm border mx-4 mb-4 ${className}`}>
      {children}
    </div>
  );
}

export function MobileButton({ children, onClick, variant = "primary", className = "", disabled = false }) {
  const baseClasses = "w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2";
  
  const variants = {
    primary: "bg-gradient-to-r from-green-600 to-emerald-500 text-white shadow-lg hover:shadow-xl active:scale-95",
    secondary: "bg-gray-100 text-gray-700 hover:bg-gray-200 active:scale-95",
    danger: "bg-red-500 text-white hover:bg-red-600 active:scale-95"
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variants[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {children}
    </button>
  );
}

export function MobileInput({ label, type = "text", value, onChange, placeholder, options = [] }) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      {type === "select" ? (
        <select
          value={value}
          onChange={onChange}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
        >
          {options.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      )}
    </div>
  );
}

export function MobileStatusBar({ weather, location }) {
  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-3 mx-4 mb-4">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <span className="text-green-600">📍</span>
          <span className="font-medium">{location || "Location"}</span>
        </div>
        {weather && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <span>🌡️</span>
              <span>{weather.temperature}°C</span>
            </div>
            <div className="flex items-center gap-1">
              <span>🌧️</span>
              <span>{weather.rainfall}mm</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function MobileLoadingSpinner({ message = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
      <p className="text-gray-600 text-sm">{message}</p>
    </div>
  );
}

export function MobileAlert({ type = "info", message, onClose }) {
  const colors = {
    info: "bg-blue-50 border-blue-200 text-blue-800",
    success: "bg-green-50 border-green-200 text-green-800",
    warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
    error: "bg-red-50 border-red-200 text-red-800"
  };

  const icons = {
    info: "ℹ️",
    success: "✅",
    warning: "⚠️",
    error: "❌"
  };

  return (
    <div className={`border rounded-lg p-3 mx-4 mb-4 ${colors[type]}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-2">
          <span className="text-lg">{icons[type]}</span>
          <p className="text-sm font-medium">{message}</p>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-lg leading-none">×</button>
        )}
      </div>
    </div>
  );
}