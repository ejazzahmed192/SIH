import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import {
  Settings as SettingsIcon,
  Moon,
  Sun,
  Monitor,
  Bell,
  Globe,
  Save,
  RefreshCw,
  Shield,
  Database,
  Download,
  Upload,
  Palette,
  Zap,
  Volume2,
  VolumeX,
  Eye,
  EyeOff,
  CheckCircle
} from 'lucide-react';

export default function Settings() {
  const { state, dispatch } = useTheme();
  const [activeTab, setActiveTab] = useState('appearance');
  const [saved, setSaved] = useState(false);

  const tabs = [
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'system', label: 'System', icon: SettingsIcon },
    { id: 'data', label: 'Data & Privacy', icon: Shield },
    { id: 'advanced', label: 'Advanced', icon: Zap }
  ];

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'zh', name: '中文', flag: '🇨🇳' }
  ];

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleThemeChange = (theme: 'light' | 'dark') => {
    dispatch({ type: 'SET_THEME', payload: theme });
  };

  const handleLanguageChange = (language: string) => {
    dispatch({ type: 'SET_LANGUAGE', payload: language });
  };

  const renderAppearanceTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Theme</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => handleThemeChange('light')}
            className={`p-4 rounded-xl border-2 transition-all duration-200 ${
              state.theme === 'light'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <div className="flex items-center justify-center mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
                <Sun className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="text-center">
              <div className="font-medium text-gray-900 dark:text-white">Light</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Clean and bright</div>
            </div>
          </button>

          <button
            onClick={() => handleThemeChange('dark')}
            className={`p-4 rounded-xl border-2 transition-all duration-200 ${
              state.theme === 'dark'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <div className="flex items-center justify-center mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-gray-700 to-gray-900 rounded-lg flex items-center justify-center">
                <Moon className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="text-center">
              <div className="font-medium text-gray-900 dark:text-white">Dark</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Easy on the eyes</div>
            </div>
          </button>

          <button
            className="p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 opacity-50 cursor-not-allowed"
            disabled
          >
            <div className="flex items-center justify-center mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center">
                <Monitor className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="text-center">
              <div className="font-medium text-gray-900 dark:text-white">Auto</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Coming soon</div>
            </div>
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Animations</h3>
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
          <div className="flex items-center">
            <Zap className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-3" />
            <div>
              <div className="font-medium text-gray-900 dark:text-white">Enable Animations</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Smooth transitions and effects</div>
            </div>
          </div>
          <button
            onClick={() => dispatch({ type: 'TOGGLE_ANIMATIONS', payload: !state.animations })}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
              state.animations ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                state.animations ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Language</h3>
        <select
          value={state.language}
          onChange={(e) => handleLanguageChange(e.target.value)}
          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white"
        >
          {languages.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.flag} {lang.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
          <div className="flex items-center">
            <Bell className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-3" />
            <div>
              <div className="font-medium text-gray-900 dark:text-white">Push Notifications</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Get notified about conflicts and updates</div>
            </div>
          </div>
          <button
            onClick={() => dispatch({ type: 'TOGGLE_NOTIFICATIONS', payload: !state.notifications })}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
              state.notifications ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                state.notifications ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
          <div className="flex items-center">
            <Volume2 className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-3" />
            <div>
              <div className="font-medium text-gray-900 dark:text-white">Sound Notifications</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Play sounds for important alerts</div>
            </div>
          </div>
          <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-300 dark:bg-gray-600 transition-colors duration-200">
            <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 translate-x-1" />
          </button>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
          <div className="flex items-center">
            <RefreshCw className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-3" />
            <div>
              <div className="font-medium text-gray-900 dark:text-white">Auto-refresh</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Automatically update timetables</div>
            </div>
          </div>
          <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600 transition-colors duration-200">
            <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 translate-x-6" />
          </button>
        </div>
      </div>
    </div>
  );

  const renderSystemTab = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
          <div className="flex items-center">
            <Save className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-3" />
            <div>
              <div className="font-medium text-gray-900 dark:text-white">Auto-save</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Automatically save changes</div>
            </div>
          </div>
          <button
            onClick={() => dispatch({ type: 'TOGGLE_AUTO_SAVE', payload: !state.autoSave })}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
              state.autoSave ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                state.autoSave ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
          <div className="flex items-center mb-3">
            <Database className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-3" />
            <div className="font-medium text-gray-900 dark:text-white">Storage Usage</div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Timetables</span>
              <span className="text-gray-900 dark:text-white">2.4 MB</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '35%' }}></div>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">35% of 10 MB used</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button className="flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200">
            <RefreshCw className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-3" />
            <span className="font-medium text-gray-900 dark:text-white">Clear Cache</span>
          </button>
          
          <button className="flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200">
            <Download className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-3" />
            <span className="font-medium text-gray-900 dark:text-white">Export Settings</span>
          </button>
        </div>
      </div>
    </div>
  );

  const renderDataTab = () => (
    <div className="space-y-6">
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
        <div className="flex items-center mb-2">
          <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
          <span className="font-medium text-blue-900 dark:text-blue-100">Privacy Protected</span>
        </div>
        <p className="text-sm text-blue-800 dark:text-blue-200">
          Your data is encrypted and stored securely. We never share your information with third parties.
        </p>
      </div>

      <div className="space-y-4">
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <Database className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-3" />
              <span className="font-medium text-gray-900 dark:text-white">Data Backup</span>
            </div>
            <span className="text-sm text-green-600 dark:text-green-400">Last: 2 hours ago</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <button className="flex items-center justify-center p-3 bg-white dark:bg-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200">
              <Download className="h-4 w-4 mr-2" />
              <span className="text-sm font-medium">Download Backup</span>
            </button>
            <button className="flex items-center justify-center p-3 bg-white dark:bg-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200">
              <Upload className="h-4 w-4 mr-2" />
              <span className="text-sm font-medium">Restore Backup</span>
            </button>
          </div>
        </div>

        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
          <h4 className="font-medium text-red-900 dark:text-red-100 mb-2">Danger Zone</h4>
          <p className="text-sm text-red-800 dark:text-red-200 mb-3">
            These actions cannot be undone. Please be careful.
          </p>
          <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 text-sm font-medium">
            Delete All Data
          </button>
        </div>
      </div>
    </div>
  );

  const renderAdvancedTab = () => (
    <div className="space-y-6">
      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl">
        <div className="flex items-center mb-2">
          <Zap className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mr-2" />
          <span className="font-medium text-yellow-900 dark:text-yellow-100">Advanced Settings</span>
        </div>
        <p className="text-sm text-yellow-800 dark:text-yellow-200">
          These settings are for advanced users. Changing them may affect system performance.
        </p>
      </div>

      <div className="space-y-4">
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
            AI Generation Timeout (seconds)
          </label>
          <input
            type="number"
            min="30"
            max="300"
            defaultValue="120"
            className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
            Maximum Concurrent Generations
          </label>
          <select className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
            <option value="1">1 (Recommended)</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="5">5</option>
          </select>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
          <div className="flex items-center">
            <Eye className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-3" />
            <div>
              <div className="font-medium text-gray-900 dark:text-white">Debug Mode</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Show detailed logs and errors</div>
            </div>
          </div>
          <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-300 dark:bg-gray-600 transition-colors duration-200">
            <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 translate-x-1" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
            <SettingsIcon className="h-8 w-8 mr-3 text-blue-600 dark:text-blue-400" />
            Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">Customize your timetable generator experience</p>
        </div>
        
        <button
          onClick={handleSave}
          className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
            saved
              ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {saved ? (
            <>
              <CheckCircle className="h-5 w-5 mr-2" />
              Saved!
            </>
          ) : (
            <>
              <Save className="h-5 w-5 mr-2" />
              Save Changes
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-4 py-3 text-left rounded-xl transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-l-4 border-blue-500'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            {activeTab === 'appearance' && renderAppearanceTab()}
            {activeTab === 'notifications' && renderNotificationsTab()}
            {activeTab === 'system' && renderSystemTab()}
            {activeTab === 'data' && renderDataTab()}
            {activeTab === 'advanced' && renderAdvancedTab()}
          </div>
        </div>
      </div>
    </div>
  );
}