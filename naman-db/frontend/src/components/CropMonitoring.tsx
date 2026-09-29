import React from 'react';
import { 
  Sprout, 
  Droplets, 
  Thermometer,
  AlertTriangle,
  CheckCircle,
  TrendingUp
} from 'lucide-react';
// Language context available for future translations

interface CropData {
  id: string;
  name: string;
  field: string;
  stage: string;
  health: number;
  moisture: number;
  temperature: number;
  status: 'healthy' | 'warning' | 'critical';
  alert?: string;
  image: string;
}

const crops: CropData[] = [
  {
    id: '1',
    name: 'Corn',
    field: 'Field A',
    stage: 'Vegetative',
    health: 92,
    moisture: 68,
    temperature: 24,
    status: 'healthy',
    image: 'https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=400&h=300&fit=crop'
  },
  {
    id: '2',
    name: 'Wheat',
    field: 'Field B',
    stage: 'Tillering',
    health: 78,
    moisture: 45,
    temperature: 26,
    status: 'warning',
    alert: 'Low soil moisture detected. Consider irrigation.',
    image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=300&fit=crop'
  },
  {
    id: '3',
    name: 'Soybeans',
    field: 'Field C',
    stage: 'Flowering',
    health: 65,
    moisture: 52,
    temperature: 25,
    status: 'critical',
    alert: 'Crop health declining. Immediate attention required.',
    image: 'https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?w=400&h=300&fit=crop'
  },
  {
    id: '4',
    name: 'Rice',
    field: 'Field D',
    stage: 'Heading',
    health: 88,
    moisture: 85,
    temperature: 28,
    status: 'healthy',
    image: 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=400&h=300&fit=crop'
  },
  {
    id: '5',
    name: 'Cotton',
    field: 'Field E',
    stage: 'Boll Development',
    health: 72,
    moisture: 58,
    temperature: 30,
    status: 'warning',
    alert: 'High temperature stress detected.',
    image: 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=400&h=300&fit=crop'
  },
  {
    id: '6',
    name: 'Tomatoes',
    field: 'Field F',
    stage: 'Fruiting',
    health: 95,
    moisture: 72,
    temperature: 23,
    status: 'healthy',
    image: 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=400&h=300&fit=crop'
  }
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'healthy': return 'bg-green-100 text-green-700 border-green-200';
    case 'warning': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    case 'critical': return 'bg-red-100 text-red-700 border-red-200';
    default: return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

const getHealthColor = (health: number) => {
  if (health >= 80) return 'bg-green-500';
  if (health >= 60) return 'bg-yellow-500';
  return 'bg-red-500';
};

const getMoistureColor = (moisture: number) => {
  if (moisture >= 60) return 'bg-blue-500';
  if (moisture >= 40) return 'bg-blue-400';
  return 'bg-blue-300';
};

const CropCard: React.FC<{ crop: CropData }> = ({ crop }) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-lg transition-all group">
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img 
          src={crop.image} 
          alt={crop.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <Sprout className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold text-gray-900">{crop.name}</h3>
          </div>
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusBadge(crop.status)}`}>
            {crop.status}
          </span>
        </div>
        <p className="text-gray-500 text-sm mb-4">{crop.field} • {crop.stage}</p>

        {/* Metrics */}
        <div className="space-y-3">
          {/* Crop Health */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-600 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4" />
                Crop Health
              </span>
              <span className={`text-sm font-medium ${crop.health >= 80 ? 'text-green-600' : crop.health >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                {crop.health}%
              </span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all ${getHealthColor(crop.health)}`}
                style={{ width: `${crop.health}%` }}
              />
            </div>
          </div>

          {/* Soil Moisture */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-600 flex items-center gap-1.5">
                <Droplets className="w-4 h-4" />
                Soil Moisture
              </span>
              <span className="text-sm font-medium text-gray-700">{crop.moisture}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all ${getMoistureColor(crop.moisture)}`}
                style={{ width: `${crop.moisture}%` }}
              />
            </div>
          </div>

          {/* Temperature */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 flex items-center gap-1.5">
              <Thermometer className="w-4 h-4" />
              Temperature
            </span>
            <span className="text-sm font-medium text-gray-700">{crop.temperature}°C</span>
          </div>
        </div>

        {/* Alert */}
        {crop.alert && (
          <div className={`mt-4 p-3 rounded-xl flex items-start gap-2 ${
            crop.status === 'critical' 
              ? 'bg-red-50 border border-red-100' 
              : 'bg-yellow-50 border border-yellow-100'
          }`}>
            <AlertTriangle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
              crop.status === 'critical' ? 'text-red-500' : 'text-yellow-500'
            }`} />
            <span className={`text-sm ${
              crop.status === 'critical' ? 'text-red-700' : 'text-yellow-700'
            }`}>
              {crop.alert}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

const CropMonitoring: React.FC = () => {

  const healthyCrops = crops.filter(c => c.status === 'healthy').length;
  const warningCrops = crops.filter(c => c.status === 'warning').length;
  const criticalCrops = crops.filter(c => c.status === 'critical').length;

  return (
    <div className="p-6 h-full overflow-y-auto bg-gray-50">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Crop Monitoring</h1>
            <p className="text-gray-500 mt-1">Real-time health status and environmental conditions</p>
          </div>
          
          {/* Quick Stats */}
          <div className="flex gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-xl border border-green-100">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-700">{healthyCrops} Healthy</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-yellow-50 rounded-xl border border-yellow-100">
              <AlertTriangle className="w-4 h-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-700">{warningCrops} Warning</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-red-50 rounded-xl border border-red-100">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span className="text-sm font-medium text-red-700">{criticalCrops} Critical</span>
            </div>
          </div>
        </div>

        {/* Crop Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {crops.map((crop) => (
            <CropCard key={crop.id} crop={crop} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CropMonitoring;
