import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard,
  Camera,
  Shield,
  Cloud,
  Bot,
  Menu,
  X,
  AlertCircle,
  Globe,
  Bell,
  Settings,
  Leaf,
  Volume2,
  VolumeX,
  Moon,
  Sun,
  Check,
  Bug,
  Droplets,
  Thermometer,
  AlertTriangle,
  TrendingUp,
  Smartphone,
  LogOut
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import PlantScanner from './components/PlantScanner';
import IPMPlanner from './components/IPMPlanner';
import WeatherDashboard from './components/WeatherDashboard';
import AIAgent from './components/AIAgent';
import AdvisoryPlanner from './components/AdvisoryPlanner';
import MarketPrices from './components/MarketPrices';
import apiService from './services/api';
import { LanguageProvider, useLanguage, LANGUAGES } from './context/LanguageContext';

type Tab = 'dashboard' | 'scanner' | 'ipm' | 'weather' | 'advisory' | 'market' | 'agent';

interface AIStatus {
  primary_provider: string;
  ollama: { status: string; models: string[] };
  groq: { status: string };
  gemini: { status: string };
}

const MainApp: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [aiStatus, setAiStatus] = useState<AIStatus | null>(null);
  const [connectionError, setConnectionError] = useState(false);
  const [isSendingSMS, setIsSendingSMS] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true';
  });
  const [autoSpeak, setAutoSpeak] = useState(true);
  
  // PWA Install State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  
  const { language, setLanguage, getCurrentLanguage, t } = useLanguage();

  // Sample notifications - in a real app, these would come from the backend
  const notifications = [
    { id: 1, type: 'warning', icon: Bug, title: 'Pest Alert', message: 'Aphid activity detected in Field A - North Section', time: '10 min ago', unread: true },
    { id: 2, type: 'info', icon: Droplets, title: 'Irrigation Reminder', message: 'Scheduled irrigation for Field B in 2 hours', time: '1 hour ago', unread: true },
    { id: 3, type: 'success', icon: Check, title: 'Analysis Complete', message: 'Leaf scan results ready - No disease detected', time: '2 hours ago', unread: false },
    { id: 4, type: 'warning', icon: Thermometer, title: 'Weather Alert', message: 'Frost warning tonight - Consider crop protection', time: '3 hours ago', unread: false },
    { id: 5, type: 'info', icon: AlertTriangle, title: 'Soil Health', message: 'Nitrogen levels below optimal in Field C', time: '5 hours ago', unread: false },
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  const handleDemoSMS = async () => {
    setIsSendingSMS(true);
    try {
      await apiService.sendSMSAlert("+918400705180", "weather", "Wheat", "rain", false);
      alert("Demo SMS sent successfully! Check your phone.");
    } catch (error) {
      console.error("SMS Error:", error);
      alert("Failed to send Demo SMS. Check console.");
    } finally {
      setIsSendingSMS(false);
    }
  };

  const handleDemoWhatsApp = async () => {
    setIsSendingSMS(true);
    try {
      await apiService.sendSMSAlert("+918400705180", "weather", "Wheat", "rain", true);
      alert("Demo WhatsApp sent successfully! Check your phone.");
    } catch (error) {
      console.error("WhatsApp Error:", error);
      alert("Failed to send Demo WhatsApp. Check console.");
    } finally {
      setIsSendingSMS(false);
    }
  };

  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
        } else {
          console.log('User dismissed the install prompt');
        }
        setDeferredPrompt(null);
        setIsInstallable(false);
      });
    }
  };

  useEffect(() => {
    // Check backend connection
    apiService.getAIStatus()
      .then(status => {
        setAiStatus(status);
        setConnectionError(false);
      })
      .catch(() => {
        setConnectionError(true);
      });

    // PWA Install Event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Dark Mode Sync Effect
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [darkMode]);

  const tabs = [
    { id: 'dashboard' as Tab, label: t('dashboard') || 'Dashboard', icon: LayoutDashboard },
    { id: 'scanner' as Tab, label: t('scanner') || 'Scanner', icon: Camera },
    { id: 'ipm' as Tab, label: t('ipm') || 'IPM Strategy', icon: Shield },
    { id: 'weather' as Tab, label: t('weather') || 'Weather', icon: Cloud },
    { id: 'advisory' as Tab, label: t('advisory') || 'Advisory', icon: Leaf },
    { id: 'market' as Tab, label: t('market') || 'Mandi Prices', icon: TrendingUp },
    { id: 'agent' as Tab, label: t('agent') || 'AI Agent', icon: Bot },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'scanner':
        return <PlantScanner />;
      case 'ipm':
        return <IPMPlanner />;
      case 'weather':
        return <WeatherDashboard />;
      case 'advisory':
        return <AdvisoryPlanner />;
      case 'market':
        return <MarketPrices />;
      case 'agent':
        return <AIAgent />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-watermark text-gray-900">
      {/* Connection Error Banner */}
      {connectionError && (
        <div className="bg-red-500 text-white px-4 py-2 text-center text-sm">
          <AlertCircle className="inline w-4 h-4 mr-2" />
          Backend not connected. Make sure to run the FastAPI server.
        </div>
      )}

      {/* Header */}
      <header className="glass border-b border-white/30 px-4 lg:px-6 py-3 flex items-center justify-between relative z-50 shadow-sm">
        {/* Logo & Brand & Sidebar Toggle */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 hover:bg-white/50 rounded-lg transition-colors border border-transparent hover:border-white/40"
          >
            <Menu className="w-6 h-6 text-gray-700" />
          </button>
          
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/25">
            <Leaf className="w-6 h-6 text-white" />
          </div>
          <div className="hidden sm:block">
            <h1 className="font-bold text-gray-900 text-lg">AgriGuard</h1>
            <p className="text-xs text-gray-500 hidden md:block">AI-Powered Precision Farming & Pest Management</p>
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2">
          {/* AI Status Indicator */}
          {aiStatus && (
            <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 glass rounded-lg border border-white/40">
              <div className={`w-2 h-2 rounded-full ${
                aiStatus.groq.status === 'ready' ? 'bg-green-500' : 'bg-gray-400'
              }`} />
              <span className="text-xs text-gray-600">AI Connected</span>
            </div>
          )}

          {/* Install App Button (PWA) */}
          <button
            onClick={() => {
              if (deferredPrompt) {
                deferredPrompt.prompt();
                deferredPrompt.userChoice.then(() => {
                  setDeferredPrompt(null);
                  setIsInstallable(false);
                });
              } else {
                alert("To install as a mobile app, please use Chrome on Android or Safari on iOS and select 'Add to Home Screen'.");
              }
            }}
            className="flex items-center gap-2 px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors shadow-sm hidden sm:flex"
            title="Install AgriGuard App"
          >
            <Smartphone className="w-4 h-4" />
            <span className="text-xs font-medium">Install App</span>
          </button>

          {/* Demo Alerts Dropdown */}
          <div className="relative group hidden sm:block">
            <button
              disabled={isSendingSMS}
              className="flex items-center gap-2 px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg transition-colors border border-green-200"
              title="Send Demo Alerts"
            >
              <Smartphone className={`w-4 h-4 ${isSendingSMS ? 'animate-pulse' : ''}`} />
              <span className="text-xs font-medium">
                {isSendingSMS ? 'Sending...' : 'Demo Alerts'}
              </span>
            </button>
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
              <div className="py-2">
                <button
                  onClick={handleDemoSMS}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <Smartphone className="w-4 h-4 text-gray-400" />
                  Send SMS Alert
                </button>
                <button
                  onClick={handleDemoWhatsApp}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
                  Send WhatsApp Alert
                </button>
              </div>
            </div>
          </div>

          {/* Language Selector */}
          <div className="relative">
            <button
              onClick={() => setShowLanguageMenu(!showLanguageMenu)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
              title="Change language"
            >
              <span className="text-lg">{getCurrentLanguage().flag}</span>
              <Globe className="w-4 h-4 text-gray-500 hidden sm:block" />
            </button>

            {showLanguageMenu && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowLanguageMenu(false)} 
                />
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 max-h-80 overflow-y-auto">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code);
                        setShowLanguageMenu(false);
                      }}
                      className={`w-full px-4 py-2.5 text-left hover:bg-gray-50 flex items-center gap-3 ${
                        language === lang.code ? 'bg-primary-50 text-primary-700' : 'text-gray-700'
                      }`}
                    >
                      <span className="text-lg">{lang.flag}</span>
                      <span className="text-sm font-medium">{lang.name}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Notifications */}
          <div className="relative">
            <button 
              onClick={() => { setShowNotifications(!showNotifications); setShowSettings(false); setShowLanguageMenu(false); }}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative" 
              title="Notifications"
            >
              <Bell className="w-5 h-5 text-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-medium">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                    <h3 className="font-semibold text-gray-800">Notifications</h3>
                    <span className="text-xs text-primary-600 font-medium cursor-pointer hover:underline">Mark all read</span>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.map((notif) => (
                      <div 
                        key={notif.id} 
                        className={`px-4 py-3 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors ${notif.unread ? 'bg-primary-50/30' : ''}`}
                      >
                        <div className="flex gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            notif.type === 'warning' ? 'bg-orange-100 text-orange-600' :
                            notif.type === 'success' ? 'bg-green-100 text-green-600' :
                            'bg-blue-100 text-blue-600'
                          }`}>
                            <notif.icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-sm text-gray-800">{notif.title}</p>
                              {notif.unread && <span className="w-2 h-2 bg-primary-500 rounded-full" />}
                            </div>
                            <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">{notif.message}</p>
                            <p className="text-xs text-gray-400 mt-1">{notif.time}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="px-4 py-2 border-t border-gray-100 bg-gray-50">
                    <button className="w-full text-center text-sm text-primary-600 font-medium hover:underline">
                      View all notifications
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Settings */}
          <div className="relative hidden sm:block">
            <button 
              onClick={() => { setShowSettings(!showSettings); setShowNotifications(false); setShowLanguageMenu(false); }}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors" 
              title="Settings"
            >
              <Settings className="w-5 h-5 text-gray-600" />
            </button>

            {showSettings && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowSettings(false)} />
                <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                    <h3 className="font-semibold text-gray-800">Settings</h3>
                  </div>
                  <div className="p-4 space-y-4">
                    {/* Voice Settings */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {voiceEnabled ? <Volume2 className="w-5 h-5 text-primary-600" /> : <VolumeX className="w-5 h-5 text-gray-400" />}
                        <div>
                          <p className="text-sm font-medium text-gray-800">Voice Input</p>
                          <p className="text-xs text-gray-500">Enable microphone</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setVoiceEnabled(!voiceEnabled)}
                        className={`w-11 h-6 rounded-full transition-colors relative ${voiceEnabled ? 'bg-primary-500' : 'bg-gray-300'}`}
                        title="Toggle voice input"
                      >
                        <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${voiceEnabled ? 'right-1' : 'left-1'}`} />
                      </button>
                    </div>

                    {/* Auto Speak Responses */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Volume2 className={`w-5 h-5 ${autoSpeak ? 'text-primary-600' : 'text-gray-400'}`} />
                        <div>
                          <p className="text-sm font-medium text-gray-800">Auto-Speak</p>
                          <p className="text-xs text-gray-500">Read AI responses aloud</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setAutoSpeak(!autoSpeak)}
                        className={`w-11 h-6 rounded-full transition-colors relative ${autoSpeak ? 'bg-primary-500' : 'bg-gray-300'}`}
                        title="Toggle auto-speak"
                      >
                        <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${autoSpeak ? 'right-1' : 'left-1'}`} />
                      </button>
                    </div>

                    {/* Dark Mode */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {darkMode ? <Moon className="w-5 h-5 text-primary-600" /> : <Sun className="w-5 h-5 text-gray-400" />}
                        <div>
                          <p className="text-sm font-medium text-gray-800">Dark Mode</p>
                          <p className="text-xs text-gray-500">Enable dark theme</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setDarkMode(!darkMode)}
                        className={`w-11 h-6 rounded-full transition-colors relative ${darkMode ? 'bg-primary-500' : 'bg-gray-300'}`}
                        title="Toggle dark mode"
                      >
                        <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${darkMode ? 'right-1' : 'left-1'}`} />
                      </button>
                    </div>

                    <div className="pt-2 border-t border-gray-100">
                      <p className="text-xs text-gray-500 mb-2">AI Provider Status</p>
                      {aiStatus && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Groq</span>
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${aiStatus.groq?.status === 'ready' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                              {aiStatus.groq?.status || 'not_configured'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Gemini</span>
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${aiStatus.gemini?.status === 'ready' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                              {aiStatus.gemini?.status || 'not_configured'}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Profile */}
          <div className="w-9 h-9 bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg hidden sm:flex items-center justify-center text-white font-medium text-sm">
            AF
          </div>
        </div>
      </header>

      {/* Sidebar Overlay */}
      <div 
        className={`fixed inset-0 z-[100] transition-opacity duration-300 ease-in-out ${
          mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="absolute inset-0 bg-black/40" onClick={() => setMobileMenuOpen(false)} />
        
        <div 
          className={`absolute inset-y-0 left-0 w-64 sm:w-72 bg-white/95 backdrop-blur-xl shadow-2xl flex flex-col transition-transform duration-300 ease-in-out transform ${
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="p-5 flex items-center justify-between border-b border-gray-100/50">
             <div className="flex items-center gap-3">
               <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                 <Leaf className="w-5 h-5 text-white" />
               </div>
               <span className="font-bold text-gray-900">AgriGuard</span>
             </div>
             <button onClick={() => setMobileMenuOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
               <X className="w-5 h-5 text-gray-500" />
             </button>
          </div>
          
          <nav className="flex-1 overflow-y-auto p-4 space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all ${
                  activeTab === tab.id
                    ? 'bg-primary-50 text-primary-700 shadow-sm border border-primary-100'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-primary-600' : 'text-gray-400'}`} />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </nav>
          
          <div className="p-4 border-t border-gray-100/50 space-y-4">
            <button
              onClick={() => navigate('/')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-colors font-medium"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
            <div className="text-xs text-center text-gray-400">
               AgriGuard Dashboard v2.0
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        {renderContent()}
      </main>
    </div>
  );
};

// Wrap App with LanguageProvider
const MainAppWithLanguage: React.FC = () => (
  <LanguageProvider>
    <MainApp />
  </LanguageProvider>
);

export default MainAppWithLanguage;
