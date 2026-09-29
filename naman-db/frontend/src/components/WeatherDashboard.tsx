import React, { useState, useEffect } from 'react';
import { 
  Cloud, 
  Droplets, 
  Wind, 
  AlertTriangle,
  CheckCircle,
  MapPin,
  RefreshCw,
  Leaf,
  Bug
} from 'lucide-react';
import apiService from '../services/api';
import { useLanguage } from '../context/LanguageContext';

interface WeatherData {
  temperature: number;
  humidity: number;
  wind_speed: number;
  precipitation: number;
  condition: string;
}

interface DiseaseRisk {
  fungal_disease_risk: string;
  bacterial_disease_risk: string;
  pest_activity_risk: string;
  spray_conditions: string;
  overall_risk_level: string;
  overall_risk_score: number;
  alerts: string[];
  recommendations: string[];
}

interface SprayWindow {
  date: string;
  quality: string;
  recommended_time: string;
  conditions: {
    wind_speed: number;
    precipitation: number;
    humidity: number;
  };
}

const WeatherDashboard: React.FC = () => {
  const { t } = useLanguage();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [risks, setRisks] = useState<DiseaseRisk | null>(null);
  const [sprayWindows, setSprayWindows] = useState<SprayWindow[]>([]);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWeatherData = async (lat: number, lng: number) => {
    setLoading(true);
    setError(null);
    try {
      const [weatherData, riskData, windowsData] = await Promise.all([
        apiService.getCurrentWeather(lat, lng),
        apiService.getDiseaseRisk(lat, lng),
        apiService.getSprayWindows(lat, lng),
      ]);

      setWeather(weatherData);
      setRisks(riskData.risks);
      setSprayWindows(windowsData.optimal_windows || []);
    } catch (err) {
      console.error('Error fetching weather:', err);
      setError('Failed to fetch weather data. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const requestLocation = () => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          setLocation(loc);
          fetchWeatherData(loc.latitude, loc.longitude);
        },
        (err) => {
          console.log('Location error:', err);
          alert('Could not access your location. Please check your browser permissions.');
          // Default to a location (Delhi) if we don't have one yet
          if (!location) {
            const defaultLoc = { latitude: 28.6139, longitude: 77.209 };
            setLocation(defaultLoc);
            fetchWeatherData(defaultLoc.latitude, defaultLoc.longitude);
          } else {
            setLoading(false);
          }
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  useEffect(() => {
    requestLocation();
  }, []);

  const getRiskColor = (risk: string) => {
    switch (risk.toLowerCase()) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getSprayQualityColor = (quality: string) => {
    switch (quality.toLowerCase()) {
      case 'excellent': return 'border-green-500 bg-green-50';
      case 'good': return 'border-yellow-500 bg-yellow-50';
      case 'moderate': return 'border-orange-500 bg-orange-50';
      default: return 'border-gray-300 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-primary-600 animate-spin mx-auto" />
          <p className="mt-2 text-gray-600">{t('loadingWeather')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{t('failedWeather')}</p>
          <button
            onClick={() => location && fetchWeatherData(location.latitude, location.longitude)}
            className="mt-2 text-red-600 underline"
          >
            {t('tryAgain')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6 overflow-y-auto h-full bg-transparent">
      {/* Location header */}
      <div className="glass-card p-4 sm:p-6 mb-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2 text-gray-600">
          <MapPin className="w-4 h-4" />
          <span className="text-sm">
            {location ? `${location.latitude.toFixed(2)}, ${location.longitude.toFixed(2)}` : t('locationUnavailable')}
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={requestLocation}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-1 text-sm text-primary-600 font-medium border border-primary-100"
            title="Use My Real Location"
          >
            <MapPin className="w-4 h-4" />
            <span className="hidden sm:inline">Get My Location</span>
          </button>
          <button
            onClick={() => location && fetchWeatherData(location.latitude, location.longitude)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
            title={t('refreshWeather')}
          >
            <RefreshCw className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Current Weather */}
      <div className="glass-card p-6 border-t-4 border-t-primary-500 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50/80 to-primary-100/80 -z-10" />
        <div className="flex items-start justify-between relative z-10">
          <div>
            <h2 className="text-lg font-bold text-gray-800">{t('currentWeather')}</h2>
            <p className="text-5xl font-light mt-2 text-primary-700">{weather?.temperature}°C</p>
            <p className="text-lg font-medium text-gray-600 mt-1">{weather?.condition}</p>
          </div>
          <Cloud className="w-16 h-16 text-primary-400" />
        </div>
        
        <div className="grid grid-cols-3 gap-4 mt-6 relative z-10">
          <div className="text-center bg-white/60 rounded-xl p-3 border border-white/50 shadow-sm">
            <Droplets className="w-6 h-6 mx-auto text-blue-500 mb-1" />
            <p className="text-lg font-bold text-gray-800">{weather?.humidity}%</p>
            <p className="text-xs font-medium text-gray-600">{t('humidity')}</p>
          </div>
          <div className="text-center bg-white/60 rounded-xl p-3 border border-white/50 shadow-sm">
            <Wind className="w-6 h-6 mx-auto text-teal-500 mb-1" />
            <p className="text-lg font-bold text-gray-800">{weather?.wind_speed} km/h</p>
            <p className="text-xs font-medium text-gray-600">{t('wind')}</p>
          </div>
          <div className="text-center bg-white/60 rounded-xl p-3 border border-white/50 shadow-sm">
            <Cloud className="w-6 h-6 mx-auto text-gray-400 mb-1" />
            <p className="text-lg font-bold text-gray-800">{weather?.precipitation} mm</p>
            <p className="text-xs font-medium text-gray-600">{t('rain')}</p>
          </div>
        </div>
      </div>

      {/* Disease Risk Assessment */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-yellow-500" />
          {t('diseaseRiskTitle')}
        </h3>

        {/* Overall Risk */}
        <div className="mb-4 p-4 bg-white/50 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">{t('overallRisk')}</span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(risks?.overall_risk_level || 'low')}`}>
              {risks?.overall_risk_level?.toUpperCase()}
            </span>
          </div>
          <div className="mt-2 bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${
                (risks?.overall_risk_score || 0) > 66 ? 'bg-red-500' :
                (risks?.overall_risk_score || 0) > 33 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${risks?.overall_risk_score || 0}%` }}
            />
          </div>
        </div>

        {/* Individual Risks */}
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
            <div className="flex items-center gap-2">
              <Leaf className="w-4 h-4 text-green-600" />
              <span className="text-sm">{t('fungalDisease')}</span>
            </div>
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${getRiskColor(risks?.fungal_disease_risk || 'low')}`}>
              {risks?.fungal_disease_risk}
            </span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
            <div className="flex items-center gap-2">
              <Bug className="w-4 h-4 text-red-600" />
              <span className="text-sm">{t('pestActivity')}</span>
            </div>
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${getRiskColor(risks?.pest_activity_risk || 'low')}`}>
              {risks?.pest_activity_risk}
            </span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
            <div className="flex items-center gap-2">
              <Wind className="w-4 h-4 text-blue-600" />
              <span className="text-sm">{t('sprayConditions')}</span>
            </div>
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
              risks?.spray_conditions === 'good' ? 'text-green-600 bg-green-100' :
              risks?.spray_conditions === 'moderate' ? 'text-yellow-600 bg-yellow-100' :
              'text-red-600 bg-red-100'
            }`}>
              {risks?.spray_conditions}
            </span>
          </div>
        </div>

        {/* Alerts */}
        {risks?.alerts && risks.alerts.length > 0 && (
          <div className="mt-4 space-y-2">
            <h4 className="text-sm font-medium text-gray-700">{t('alerts')}</h4>
            {risks.alerts.map((alert, idx) => (
              <div key={idx} className="flex items-start gap-2 p-3 bg-yellow-50/80 rounded-lg border border-yellow-200/50">
                <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-yellow-800">{alert}</span>
              </div>
            ))}
          </div>
        )}

        {/* Recommendations */}
        {risks?.recommendations && risks.recommendations.length > 0 && (
          <div className="mt-4 space-y-2">
            <h4 className="text-sm font-medium text-gray-700">{t('recommendations')}</h4>
            {risks.recommendations.map((rec, idx) => (
              <div key={idx} className="flex items-start gap-2 p-3 bg-green-50/80 rounded-lg border border-green-200/50">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-green-800">{rec}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Optimal Spray Windows */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Droplets className="w-5 h-5 text-blue-500" />
          {t('sprayWindows')}
        </h3>

        {sprayWindows.length > 0 ? (
          <div className="space-y-3">
            {sprayWindows.slice(0, 5).map((window, idx) => (
              <div 
                key={idx}
                className={`p-4 rounded-xl border-l-4 ${getSprayQualityColor(window.quality)}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{window.date}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    window.quality === 'excellent' ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800'
                  }`}>
                    {window.quality.toUpperCase()}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{window.recommended_time}</p>
                <div className="flex gap-4 mt-2 text-xs text-gray-500">
                  <span>{t('wind')}: {window.conditions.wind_speed} km/h</span>
                  <span>{t('humidity')}: {window.conditions.humidity}%</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">{t('noSprayWindows')}</p>
        )}
      </div>
    </div>
  );
};

export default WeatherDashboard;
