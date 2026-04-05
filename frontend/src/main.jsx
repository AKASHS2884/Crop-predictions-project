import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

// Capacitor native plugins (no-op on web)
async function initCapacitor() {
  try {
    const { StatusBar, Style } = await import('@capacitor/status-bar');
    await StatusBar.setStyle({ style: Style.Dark });
    await StatusBar.setBackgroundColor({ color: '#16a34a' });
  } catch (_) { /* running in browser */ }

  try {
    const { Keyboard } = await import('@capacitor/keyboard');
    Keyboard.setAccessoryBarVisible({ isVisible: false });
  } catch (_) { /* running in browser */ }
}

initCapacitor();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
