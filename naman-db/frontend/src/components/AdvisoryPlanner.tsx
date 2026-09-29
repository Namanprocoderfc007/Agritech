import React, { useState, useEffect } from 'react';
import { Calendar, Droplets, Leaf, Activity, Loader2, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import apiService from '../services/api';

export default function AdvisoryPlanner() {
  const [crop, setCrop] = useState('wheat');
  const [sowingDate, setSowingDate] = useState(new Date().toISOString().split('T')[0]);
  const [soilN, setSoilN] = useState(150);
  const [soilP, setSoilP] = useState(20);
  const [soilK, setSoilK] = useState(100);
  
  const [location, setLocation] = useState<{lat: number, lon: number} | null>(null);
  const [locationStatus, setLocationStatus] = useState<string>('Detecting location for weather forecast...');
  
  const [loading, setLoading] = useState(false);
  const [schedule, setSchedule] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
          setLocationStatus('Location detected. Weather forecast enabled.');
        },
        (error) => {
          console.error("Location error:", error);
          setLocationStatus('Could not detect location. Weather forecast disabled.');
        }
      );
    } else {
      setLocationStatus('Geolocation not supported. Weather forecast disabled.');
    }
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const data = await apiService.generateSchedule(
        crop, 
        sowingDate, 
        soilN, 
        soilP, 
        soilK,
        location?.lat,
        location?.lon
      );
      setSchedule(data);
    } catch (err: any) {
      setError(err.message || 'Failed to generate schedule');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-transparent">
      <div className="p-4 lg:p-8 max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="glass-card p-4 sm:p-6 mb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="w-7 h-7 text-primary-600" />
            Smart Crop Advisory & Schedule
          </h2>
          <p className="text-gray-700 mt-1">Get personalized irrigation and fertilizer schedules based on soil health.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Section */}
        <div className="glass-card overflow-hidden lg:col-span-1 h-fit">
          <div className="bg-white/40 px-6 py-4 border-b border-white/50">
            <h3 className="font-semibold text-primary-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary-600" />
              Farm Parameters
            </h3>
          </div>
          <form onSubmit={handleGenerate} className="p-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Crop Type</label>
              <select 
                value={crop} 
                onChange={(e) => setCrop(e.target.value)}
                className="w-full rounded-xl border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 p-2 border"
              >
                <option value="wheat">Wheat</option>
                <option value="rice">Rice</option>
                <option value="tomato">Tomato</option>
                <option value="cotton">Cotton</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sowing Date</label>
              <input 
                type="date" 
                value={sowingDate}
                onChange={(e) => setSowingDate(e.target.value)}
                className="w-full rounded-xl border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 p-2 border"
                required
              />
            </div>

            <div className="pt-4 border-t border-gray-100">
              <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-1.5">
                <Leaf className="w-4 h-4 text-green-600" />
                Soil Health (NPK)
              </h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Nitrogen (N) kg/ha</label>
                  <input type="number" value={soilN} onChange={(e) => setSoilN(Number(e.target.value))} className="w-full rounded-lg border-gray-300 p-2 border text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Phosphorus (P) kg/ha</label>
                  <input type="number" value={soilP} onChange={(e) => setSoilP(Number(e.target.value))} className="w-full rounded-lg border-gray-300 p-2 border text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Potassium (K) kg/ha</label>
                  <input type="number" value={soilK} onChange={(e) => setSoilK(Number(e.target.value))} className="w-full rounded-lg border-gray-300 p-2 border text-sm" />
                </div>
              </div>
            </div>

            <div className="pt-2">
               <p className={`text-xs flex items-center gap-1 ${location ? 'text-green-600' : 'text-orange-500'}`}>
                 {location ? <CheckCircle className="w-3 h-3" /> : <Info className="w-3 h-3" />}
                 {locationStatus}
               </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 text-white rounded-xl py-3 font-medium hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Generating...</>
              ) : (
                'Generate Schedule'
              )}
            </button>
          </form>
        </div>

        {/* Results Section */}
        <div className="lg:col-span-2 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-xl flex items-start gap-3 border border-red-100">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {!schedule && !loading && !error && (
            <div className="glass-card p-12 text-center h-full flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mb-4">
                <Calendar className="w-8 h-8 text-primary-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Schedule Generated</h3>
              <p className="text-gray-500 max-w-sm">Enter your farm details and soil parameters to generate a personalized timeline for irrigation and fertilization.</p>
            </div>
          )}

          {schedule && (
            <>
              {/* Soil Alerts */}
              <div className="glass-card p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-gray-600" />
                  Soil Health Insights
                </h3>
                <div className="grid gap-3">
                  {schedule.soil_health_alerts.map((alert: any, i: number) => (
                    <div key={i} className={`p-4 rounded-xl flex items-start gap-3 border ${
                      alert.type === 'warning' ? 'bg-orange-50 border-orange-100 text-orange-800' :
                      alert.type === 'success' ? 'bg-green-50 border-green-100 text-green-800' :
                      'bg-blue-50 border-blue-100 text-blue-800'
                    }`}>
                      {alert.type === 'warning' ? <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" /> :
                       alert.type === 'success' ? <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" /> :
                       <Info className="w-5 h-5 shrink-0 mt-0.5" />}
                      <p className="text-sm leading-relaxed">{alert.message}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Timeline */}
              <div className="glass-card overflow-hidden">
                <div className="bg-white/40 px-6 py-4 border-b border-white/50 flex justify-between items-center">
                  <h3 className="font-semibold text-gray-900">Crop Lifecycle Schedule</h3>
                  <span className="text-sm text-primary-600 bg-primary-50 px-3 py-1 rounded-full font-medium">
                    Day {schedule.days_since_sowing} - {schedule.current_stage}
                  </span>
                </div>
                <div className="p-6">
                  <div className="relative border-l-2 border-gray-100 ml-3 space-y-8">
                    {schedule.timeline.map((step: any, i: number) => (
                      <div key={i} className={`relative pl-8 transition-opacity ${step.status === 'completed' ? 'opacity-60' : 'opacity-100'}`}>
                        {/* Timeline dot */}
                        <div className={`absolute -left-[9px] top-1.5 w-4 h-4 rounded-full border-2 bg-white ${
                          step.status === 'current' ? 'border-primary-500 ring-4 ring-primary-50' : 
                          step.status === 'completed' ? 'border-green-500 bg-green-500' : 
                          'border-gray-300'
                        }`} />
                        
                        <div className="mb-1 flex flex-wrap items-center gap-2">
                          <span className="text-sm font-bold text-gray-900">{step.stage}</span>
                          <span className="text-xs text-gray-500 font-medium tracking-wide">
                            {step.date} (Day {step.day_offset})
                          </span>
                          {step.status === 'current' && (
                            <span className="text-[10px] uppercase font-bold text-white bg-primary-500 px-2 py-0.5 rounded-full">Current</span>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                          <div className={`p-4 rounded-xl border ${
                            step.water_need.includes('Skip') ? 'bg-amber-50/50 border-amber-200' : 
                            step.is_critical_water ? 'bg-blue-50/50 border-blue-200' : 'bg-white/50 border-white/60'
                          }`}>
                            <div className={`flex items-center gap-1.5 mb-2 ${
                              step.water_need.includes('Skip') ? 'text-amber-700' : 'text-blue-700'
                            }`}>
                              <Droplets className="w-4 h-4" />
                              <span className="text-xs font-bold uppercase tracking-wider">Irrigation Schedule</span>
                            </div>
                            <p className="text-sm text-gray-800 font-medium">{step.water_need}</p>
                          </div>
                          
                          <div className="p-4 rounded-xl bg-emerald-50/30 border border-emerald-100">
                            <div className="flex items-center gap-1.5 mb-2 text-emerald-700">
                              <Leaf className="w-4 h-4" />
                              <span className="text-xs font-bold uppercase tracking-wider">Fertilizer Schedule</span>
                            </div>
                            <p className="text-sm text-gray-800 font-medium">{step.fertilizer_recommendation}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
    </div>
  );
}
