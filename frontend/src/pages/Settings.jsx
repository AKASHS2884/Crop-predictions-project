import { useState, useEffect } from "react";
import { MobileCard, MobileButton, MobileInput, MobileAlert } from "../components/MobileOptimized";

export default function Settings({ t, lang, setLang, isMobile }) {
  const [settings, setSettings] = useState({
    notifications: true,
    autoLocation: true,
    dataSync: false,
    theme: 'light',
    units: 'metric',
    defaultCrop: 'Rice',
    weatherProvider: 'openweather'
  });
  const [showAlert, setShowAlert] = useState(null);

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('appSettings');
    if (savedSettings) {
      setSettings({ ...settings, ...JSON.parse(savedSettings) });
    }
  }, []);

  const saveSettings = () => {
    localStorage.setItem('appSettings', JSON.stringify(settings));
    setShowAlert({ type: 'success', message: 'Settings saved successfully!' });
    setTimeout(() => setShowAlert(null), 3000);
  };

  const resetSettings = () => {
    const defaultSettings = {
      notifications: true,
      autoLocation: true,
      dataSync: false,
      theme: 'light',
      units: 'metric',
      defaultCrop: 'Rice',
      weatherProvider: 'openweather'
    };
    setSettings(defaultSettings);
    localStorage.setItem('appSettings', JSON.stringify(defaultSettings));
    setShowAlert({ type: 'success', message: 'Settings reset to default!' });
    setTimeout(() => setShowAlert(null), 3000);
  };

  const clearAllData = () => {
    if (confirm('Are you sure you want to clear all app data? This cannot be undone.')) {
      localStorage.clear();
      setShowAlert({ type: 'warning', message: 'All app data cleared!' });
      setTimeout(() => setShowAlert(null), 3000);
    }
  };

  const exportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'crop_app_settings.json';
    link.click();
  };

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  if (isMobile) {
    return (
      <div className="space-y-4">
        {showAlert && (
          <MobileAlert 
            type={showAlert.type} 
            message={showAlert.message} 
            onClose={() => setShowAlert(null)} 
          />
        )}

        {/* App Settings */}
        <MobileCard className="p-4">
          <h2 className="text-xl font-bold text-gray-800 mb-4">⚙️ App Settings</h2>
          
          <div className="space-y-4">
            <MobileInput
              label="Language"
              type="select"
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              options={['en', 'ta', 'hi']}
            />

            <MobileInput
              label="Default Crop"
              type="select"
              value={settings.defaultCrop}
              onChange={(e) => handleSettingChange('defaultCrop', e.target.value)}
              options={['Rice', 'Maize', 'Cotton', 'Sugarcane', 'Groundnut', 'Banana']}
            />

            <MobileInput
              label="Units"
              type="select"
              value={settings.units}
              onChange={(e) => handleSettingChange('units', e.target.value)}
              options={['metric', 'imperial']}
            />

            <MobileInput
              label="Theme"
              type="select"
              value={settings.theme}
              onChange={(e) => handleSettingChange('theme', e.target.value)}
              options={['light', 'dark', 'auto']}
            />
          </div>
        </MobileCard>

        {/* Privacy & Data */}
        <MobileCard className="p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">🔒 Privacy & Data</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Auto Location</p>
                <p className="text-sm text-gray-500">Automatically detect your location</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.autoLocation}
                  onChange={(e) => handleSettingChange('autoLocation', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Notifications</p>
                <p className="text-sm text-gray-500">Receive crop alerts and updates</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notifications}
                  onChange={(e) => handleSettingChange('notifications', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Data Sync</p>
                <p className="text-sm text-gray-500">Sync data across devices</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.dataSync}
                  onChange={(e) => handleSettingChange('dataSync', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
              </label>
            </div>
          </div>
        </MobileCard>

        {/* Actions */}
        <MobileCard className="p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">🔧 Actions</h3>
          
          <div className="space-y-3">
            <MobileButton onClick={saveSettings}>
              💾 Save Settings
            </MobileButton>
            
            <MobileButton variant="secondary" onClick={exportSettings}>
              📤 Export Settings
            </MobileButton>
            
            <MobileButton variant="secondary" onClick={resetSettings}>
              🔄 Reset to Default
            </MobileButton>
            
            <MobileButton variant="danger" onClick={clearAllData}>
              🗑️ Clear All Data
            </MobileButton>
          </div>
        </MobileCard>

        {/* App Info */}
        <MobileCard className="p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">ℹ️ App Info</h3>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Version:</span>
              <span className="font-medium">2.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Build:</span>
              <span className="font-medium">2025.01.15</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Platform:</span>
              <span className="font-medium">Mobile Web</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Developer:</span>
              <span className="font-medium">AgriTech Solutions</span>
            </div>
          </div>
        </MobileCard>
      </div>
    );
  }

  // Desktop version
  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">⚙️ Settings</h2>
        
        {showAlert && (
          <div className={`p-4 rounded-lg mb-6 ${
            showAlert.type === 'success' ? 'bg-green-50 text-green-800' :
            showAlert.type === 'warning' ? 'bg-yellow-50 text-yellow-800' :
            'bg-red-50 text-red-800'
          }`}>
            {showAlert.message}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">General Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Language</label>
                <select
                  value={lang}
                  onChange={(e) => setLang(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="en">English</option>
                  <option value="ta">Tamil</option>
                  <option value="hi">Hindi</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Default Crop</label>
                <select
                  value={settings.defaultCrop}
                  onChange={(e) => handleSettingChange('defaultCrop', e.target.value)}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="Rice">Rice</option>
                  <option value="Maize">Maize</option>
                  <option value="Cotton">Cotton</option>
                  <option value="Sugarcane">Sugarcane</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Privacy & Data</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Auto Location</span>
                <input
                  type="checkbox"
                  checked={settings.autoLocation}
                  onChange={(e) => handleSettingChange('autoLocation', e.target.checked)}
                  className="w-4 h-4"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <span>Notifications</span>
                <input
                  type="checkbox"
                  checked={settings.notifications}
                  onChange={(e) => handleSettingChange('notifications', e.target.checked)}
                  className="w-4 h-4"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-4 mt-8">
          <button
            onClick={saveSettings}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Save Settings
          </button>
          <button
            onClick={resetSettings}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Reset to Default
          </button>
        </div>
      </div>
    </div>
  );
}