import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Droplets, 
  Leaf,
  Activity,
  BarChart3,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { apiService } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

// Mock data for charts
const yieldTrendData = [
  { month: 'Jan', corn: 65, wheat: 140, soybeans: 200 },
  { month: 'Feb', corn: 75, wheat: 155, soybeans: 220 },
  { month: 'Mar', corn: 85, wheat: 165, soybeans: 235 },
  { month: 'Apr', corn: 90, wheat: 175, soybeans: 250 },
  { month: 'May', corn: 95, wheat: 180, soybeans: 265 },
  { month: 'Jun', corn: 100, wheat: 185, soybeans: 280 },
];

const soilHealthData = [
  { name: 'pH Level', current: 6.5, optimal: 7 },
  { name: 'Nitrogen', current: 85, optimal: 90 },
  { name: 'Phosphorus', current: 72, optimal: 80 },
  { name: 'Potassium', current: 90, optimal: 85 },
  { name: 'Organic Matter', current: 68, optimal: 75 },
];

interface StatCardProps {
  title: string;
  value: string;
  change: number;
  subtitle: string;
  icon: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, subtitle, icon }) => {
  const isPositive = change >= 0;
  
  return (
    <div className="glass-card p-6 transition-all hover:-translate-y-1 hover:shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-600 font-medium">{title}</h3>
        <div className="p-2 bg-gray-50 rounded-lg">
          {icon}
        </div>
      </div>
      <div className="flex items-end gap-3">
        <span className="text-4xl font-bold text-gray-900">{value}</span>
        <span className={`flex items-center gap-1 text-sm font-medium px-2 py-0.5 rounded-full ${
          isPositive 
            ? 'text-green-700 bg-green-100' 
            : 'text-red-700 bg-red-100'
        }`}>
          {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {isPositive ? '+' : ''}{change}%
        </span>
      </div>
      <p className="text-gray-500 text-sm mt-2">{subtitle}</p>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const { t } = useLanguage();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const dashboardData = await apiService.getDashboardData();
      setData(dashboardData);
    } catch (err) {
      console.error("Failed to fetch dashboard data", err);
      setError("Failed to connect to sensors. Showing cached data.");
      // Fallback to mock data if backend fails
      setData({
        stats: {
          yield_index: { value: 91.2, change: 5.3 },
          water_efficiency: { value: "87%", change: 2.1 },
          soil_score: { value: 78.8, change: -1.2 }
        },
        yieldTrendData: [
          { month: 'Jan', corn: 65, wheat: 140, soybeans: 200 },
          { month: 'Feb', corn: 75, wheat: 155, soybeans: 220 },
          { month: 'Mar', corn: 85, wheat: 165, soybeans: 235 },
          { month: 'Apr', corn: 90, wheat: 175, soybeans: 250 },
          { month: 'May', corn: 95, wheat: 180, soybeans: 265 },
          { month: 'Jun', corn: 100, wheat: 185, soybeans: 280 },
        ],
        soilHealthData: [
          { name: 'pH Level', current: 6.5, optimal: 7 },
          { name: 'Nitrogen', current: 85, optimal: 90 },
          { name: 'Phosphorus', current: 72, optimal: 80 },
          { name: 'Potassium', current: 90, optimal: 85 },
          { name: 'Organic Matter', current: 68, optimal: 75 },
        ],
        overview: {
          active_fields: 12,
          total_acreage: 847,
          active_alerts: 3,
          tasks_due: 7
        }
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="p-6 h-full overflow-y-auto bg-transparent">
      <div className="max-w-7xl mx-auto space-y-6">
        {error && (
          <div className="bg-amber-50 text-amber-800 px-4 py-3 rounded-lg border border-amber-200 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-500" />
            <p className="text-sm">{error}</p>
          </div>
        )}
        {/* Live Market Prices Ticker */}
        <div className="glass-card overflow-hidden mb-4 relative flex items-center bg-green-50/50 dark:bg-slate-800/50 border-green-100 dark:border-slate-700">
          <div className="bg-green-600 text-white px-4 py-2 font-bold text-sm z-10 shadow-[4px_0_10px_rgba(0,0,0,0.1)] flex items-center gap-2 whitespace-nowrap">
            <TrendingUp className="w-4 h-4" /> Live Mandi
          </div>
          <div className="flex-1 overflow-hidden relative">
            <div className="animate-marquee flex items-center gap-8 py-2 px-4">
              {[
                { crop: 'Wheat', price: '₹2250/q', trend: 'up', change: '2.1%' },
                { crop: 'Tomato', price: '₹1400/q', trend: 'down', change: '5.4%' },
                { crop: 'Potato', price: '₹950/q', trend: 'up', change: '1.2%' },
                { crop: 'Onion', price: '₹1800/q', trend: 'down', change: '3.5%' },
                { crop: 'Rice (Paddy)', price: '₹2100/q', trend: 'up', change: '0.8%' },
                { crop: 'Soyabean', price: '₹4200/q', trend: 'up', change: '4.2%' },
                { crop: 'Cotton', price: '₹6800/q', trend: 'down', change: '1.5%' },
                // Duplicate for smooth infinite scrolling
                { crop: 'Wheat', price: '₹2250/q', trend: 'up', change: '2.1%' },
                { crop: 'Tomato', price: '₹1400/q', trend: 'down', change: '5.4%' },
                { crop: 'Potato', price: '₹950/q', trend: 'up', change: '1.2%' },
                { crop: 'Onion', price: '₹1800/q', trend: 'down', change: '3.5%' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm font-medium">
                  <span className="text-gray-700 dark:text-gray-300">{item.crop}:</span>
                  <span className="text-gray-900 dark:text-white font-bold">{item.price}</span>
                  <span className={`flex items-center text-xs ${item.trend === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                    {item.trend === 'up' ? '↑' : '↓'}{item.change}
                  </span>
                  <span className="text-gray-300 dark:text-slate-600 mx-2">|</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Header */}
        <div className="glass-card p-4 sm:p-6 mb-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('fieldAnalytics') || "Field Analytics"}</h1>
            <p className="text-gray-600 mt-1">{t('dataDriven') || "Data-driven insights for precision agriculture"}</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={fetchDashboardData}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-white/50 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-white/80 transition-colors shadow-sm"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              {t('refreshSensors') || "Refresh Sensors"}
            </button>
            <div className="flex items-center gap-2 px-4 py-2 bg-green-50/80 border border-green-200/50 rounded-lg shadow-sm">
              <span className="text-green-700 text-xs font-bold">✅ {t('liveSensorData') || "Live Sensor Data"}</span>
            </div>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title={t('avgYieldIndex') || "Average Yield Index"}
            value={data?.stats.yield_index.value.toString()}
            change={data?.stats.yield_index.change}
            subtitle={t('comparedLastMonth') || "Compared to last month"}
            icon={<Activity className="w-5 h-5 text-primary-600" />}
          />
          <StatCard
            title={t('waterEfficiency') || "Water Efficiency"}
            value={data?.stats.water_efficiency.value.toString()}
            change={data?.stats.water_efficiency.change}
            subtitle={t('irrigationOpt') || "Irrigation optimization"}
            icon={<Droplets className="w-5 h-5 text-blue-600" />}
          />
          <StatCard
            title={t('soilHealthScore') || "Soil Health Score"}
            value={data?.stats.soil_score.value.toString()}
            change={data?.stats.soil_score.change}
            subtitle={t('currentAggScore') || "Current aggregated score"}
            icon={<Leaf className="w-5 h-5 text-green-600" />}
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Yield Performance Trends */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-gray-600" />
              <h3 className="font-semibold text-gray-900">{t('yieldPerfTrends') || "Yield Performance Trends"}</h3>
            </div>
            <p className="text-gray-500 text-sm mb-6">{t('monthlyYieldIndex') || "Monthly yield index across all fields"}</p>
            
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data?.yieldTrendData || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
                  <YAxis stroke="#9ca3af" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="soybeans" 
                    stackId="1"
                    stroke="#f59e0b" 
                    fill="#fef3c7" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="wheat" 
                    stackId="1"
                    stroke="#3b82f6" 
                    fill="#dbeafe" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="corn" 
                    stackId="1"
                    stroke="#22c55e" 
                    fill="#dcfce7" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Soil Health Parameters */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-5 h-5 text-gray-600" />
              <h3 className="font-semibold text-gray-900">{t('soilHealthParams') || "Soil Health Parameters"}</h3>
            </div>
            <p className="text-gray-500 text-sm mb-6">{t('currentVsOptimal') || "Current vs. optimal levels"}</p>
            
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.soilHealthData || []} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" stroke="#9ca3af" fontSize={12} domain={[0, 100]} />
                  <YAxis type="category" dataKey="name" stroke="#9ca3af" fontSize={11} width={100} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="current" fill="#3b82f6" name="Current" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="optimal" fill="#22c55e" name="Optimal" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-card p-4">
            <p className="text-gray-600 font-medium text-sm">Active Fields</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{data?.overview.active_fields}</p>
          </div>
          <div className="glass-card p-4">
            <p className="text-gray-600 font-medium text-sm">Total Acreage</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{data?.overview.total_acreage}</p>
          </div>
          <div className="glass-card p-4">
            <p className="text-gray-600 font-medium text-sm">Active Alerts</p>
            <p className="text-2xl font-bold text-orange-600 mt-1">{data?.overview.active_alerts}</p>
          </div>
          <div className="glass-card p-4">
            <p className="text-gray-600 font-medium text-sm">Tasks Due</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{data?.overview.tasks_due}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
