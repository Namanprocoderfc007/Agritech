import React, { useState, useEffect } from 'react';
import { TrendingUp, Truck, MapPin, IndianRupee, Search, Loader2, AlertTriangle, CheckCircle, BarChart3, Info } from 'lucide-react';
import apiService from '../services/api';

export default function MarketPrices() {
  const [crop, setCrop] = useState('wheat');
  const [quantity, setQuantity] = useState(10); // in quintals
  
  const [location, setLocation] = useState<{lat: number, lon: number} | null>(null);
  const [locationStatus, setLocationStatus] = useState<string>('Detecting location for nearest markets...');

  const [loading, setLoading] = useState(false);
  const [marketData, setMarketData] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
          setLocationStatus('Location detected. Finding nearest markets.');
        },
        (error) => {
          console.error("Location error:", error);
          setLocationStatus('Could not detect location. Using default markets.');
        }
      );
    } else {
      setLocationStatus('Geolocation not supported. Using default markets.');
    }
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const data = await apiService.getMarketPrices(
        crop, 
        quantity,
        location?.lat,
        location?.lon
      );
      
      setMarketData(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch market prices');
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
              <TrendingUp className="w-7 h-7 text-primary-600" />
              Real-Time Mandi Prices
            </h2>
            <p className="text-gray-700 mt-1">Compare local mandi prices and transport costs to find the most profitable market.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Search Form */}
          <div className="glass-card overflow-hidden lg:col-span-1 h-fit">
            <div className="bg-white/40 px-6 py-4 border-b border-white/50">
              <h3 className="font-semibold text-primary-900 flex items-center gap-2">
                <Search className="w-5 h-5 text-primary-600" />
                Find Best Prices
              </h3>
            </div>
            <form onSubmit={handleSearch} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Crop</label>
                <select 
                  value={crop} 
                  onChange={(e) => setCrop(e.target.value)}
                  className="w-full rounded-xl border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 p-2.5 border bg-gray-50"
                >
                  <option value="wheat">Wheat</option>
                  <option value="rice">Rice (Paddy)</option>
                  <option value="tomato">Tomato</option>
                  <option value="cotton">Cotton</option>
                  <option value="onion">Onion</option>
                  <option value="potato">Potato</option>
                  <option value="soyabean">Soyabean</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity <span className="text-gray-400 font-normal">(Quintals / 100kg)</span>
                </label>
                <input 
                  type="number" 
                  min="0.1"
                  step="0.1"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full rounded-xl border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 p-2.5 border bg-gray-50"
                  required
                />
              </div>

              <div className="pt-1 pb-2 border-t border-gray-100">
                 <p className={`text-xs flex items-center gap-1 ${location ? 'text-green-600' : 'text-orange-500'}`}>
                   {location ? <CheckCircle className="w-3 h-3" /> : <Info className="w-3 h-3" />}
                   {locationStatus}
                 </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary-600 text-white rounded-xl py-3 font-medium hover:bg-primary-700 transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                {loading ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Fetching...</>
                ) : (
                  <><Search className="w-5 h-5" /> Compare Markets</>
                )}
              </button>
            </form>
          </div>

          {/* Results Section */}
          <div className="lg:col-span-3 space-y-6">
            {error && (
              <div className="bg-red-50 text-red-700 p-4 rounded-xl flex items-start gap-3 border border-red-100">
                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            {!marketData && !loading && !error && (
              <div className="glass-card p-12 text-center h-full flex flex-col items-center justify-center min-h-[400px]">
                <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mb-4">
                  <BarChart3 className="w-8 h-8 text-primary-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Market Data Searched</h3>
                <p className="text-gray-500 max-w-sm">Select a crop and enter the quantity you want to sell to see the best mandi prices around you.</p>
              </div>
            )}

            {marketData && (
              <div className="space-y-6">
                {/* Summary Alert */}
                <div className="glass-card border-green-200/50 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                      <IndianRupee className="w-6 h-6 text-green-700" />
                    </div>
                    <div>
                      <h3 className="font-bold text-green-900 text-lg">Best Profit Recommendation</h3>
                      <p className="text-green-800 text-sm mt-1">{marketData.summary}</p>
                    </div>
                  </div>
                  <div className="bg-white/50 px-4 py-2 rounded-xl border border-white/60 shadow-sm whitespace-nowrap">
                    <span className="text-xs text-gray-500 block">Base Price / Quintal</span>
                    <span className="font-bold text-gray-900">₹{marketData.base_msp_approx}</span>
                  </div>
                </div>

                {/* Mandi Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {marketData.markets.map((mandi: any, index: number) => (
                    <div 
                      key={index} 
                      className={`glass-card p-6 border transition-all ${
                        mandi.is_recommended 
                          ? 'border-primary-500 ring-1 ring-primary-500 shadow-md relative overflow-hidden' 
                          : 'border-gray-200 hover:border-gray-300 shadow-sm'
                      }`}
                    >
                      {mandi.is_recommended && (
                        <div className="absolute top-0 right-0 bg-primary-500 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-bl-lg">
                          Top Choice
                        </div>
                      )}
                      
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                            {mandi.mandi_name}
                            {mandi.is_recommended && <CheckCircle className="w-4 h-4 text-primary-500" />}
                          </h3>
                          <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                            <MapPin className="w-3 h-3" /> {mandi.distance_km} km away
                          </p>
                        </div>
                        <div className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wide flex items-center gap-1 ${
                          mandi.demand === 'Very High' ? 'bg-green-100 text-green-800' :
                          mandi.demand === 'High' ? 'bg-blue-100 text-blue-800' :
                          mandi.demand === 'Low' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          <TrendingUp className="w-3 h-3" />
                          {mandi.demand} Demand
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4 bg-white/50 rounded-xl p-4 border border-white/60">
                        <div>
                          <p className="text-xs text-gray-500 mb-1 font-medium">Selling Price</p>
                          <p className="font-bold text-gray-900">₹{mandi.price_per_quintal} / q</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1 font-medium">Transport Cost</p>
                          <p className="font-bold text-red-600 flex items-center gap-1">
                            - ₹{mandi.transport_cost_total}
                            <Truck className="w-3 h-3" />
                          </p>
                        </div>
                      </div>

                      <div className="flex justify-between items-end pt-4 border-t border-gray-100">
                        <div>
                          <p className="text-xs text-gray-500 mb-0.5">Gross Revenue</p>
                          <p className="text-sm font-medium text-gray-700">₹{mandi.gross_revenue}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500 mb-0.5">Net Profit</p>
                          <p className={`text-2xl font-black ${mandi.is_recommended ? 'text-primary-600' : 'text-gray-900'}`}>
                            ₹{mandi.net_profit}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
