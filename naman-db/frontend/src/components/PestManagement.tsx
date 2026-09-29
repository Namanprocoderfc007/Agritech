import React from 'react';
import { 
  Bug, 
  AlertTriangle, 
  CheckCircle,
  MapPin,
  Calendar,
  TrendingUp,
  Shield,
  Eye,
  Zap
} from 'lucide-react';
// Language context available for translations

interface PestData {
  id: string;
  name: string;
  scientificName: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  affectedCrops: string[];
  affectedFields: string[];
  detectedDate: string;
  spreadRisk: string;
  status: 'active' | 'monitoring' | 'resolved';
  actions: string[];
  image: string;
}

const pests: PestData[] = [
  {
    id: '1',
    name: 'Fall Armyworm',
    scientificName: 'Spodoptera frugiperda',
    severity: 'high',
    affectedCrops: ['Corn', 'Rice'],
    affectedFields: ['Field A', 'Field D'],
    detectedDate: '2 days ago',
    spreadRisk: 'High - Favorable conditions',
    status: 'active',
    actions: ['Apply Bt-based pesticide', 'Deploy pheromone traps', 'Scout adjacent fields'],
    image: 'https://images.unsplash.com/photo-1594024972206-b7d8fdf0e52e?w=200&h=200&fit=crop'
  },
  {
    id: '2',
    name: 'Aphids',
    scientificName: 'Aphidoidea',
    severity: 'medium',
    affectedCrops: ['Wheat', 'Soybeans'],
    affectedFields: ['Field B'],
    detectedDate: '5 days ago',
    spreadRisk: 'Medium - Monitor closely',
    status: 'monitoring',
    actions: ['Release ladybugs', 'Apply neem oil spray', 'Remove heavily infested plants'],
    image: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=200&h=200&fit=crop'
  },
  {
    id: '3',
    name: 'Spider Mites',
    scientificName: 'Tetranychidae',
    severity: 'low',
    affectedCrops: ['Tomatoes'],
    affectedFields: ['Field F'],
    detectedDate: '1 week ago',
    spreadRisk: 'Low - Under control',
    status: 'resolved',
    actions: ['Continue monitoring', 'Maintain beneficial insect population'],
    image: 'https://images.unsplash.com/photo-1628352081506-83c43123ed6d?w=200&h=200&fit=crop'
  },
  {
    id: '4',
    name: 'Corn Earworm',
    scientificName: 'Helicoverpa zea',
    severity: 'critical',
    affectedCrops: ['Corn'],
    affectedFields: ['Field A'],
    detectedDate: 'Today',
    spreadRisk: 'Critical - Immediate action needed',
    status: 'active',
    actions: ['Apply targeted insecticide immediately', 'Increase monitoring frequency', 'Notify extension service'],
    image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=200&h=200&fit=crop'
  }
];

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'low': return 'bg-green-100 text-green-700 border-green-200';
    case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    case 'high': return 'bg-orange-100 text-orange-700 border-orange-200';
    case 'critical': return 'bg-red-100 text-red-700 border-red-200';
    default: return 'bg-gray-100 text-gray-700';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'active': return <AlertTriangle className="w-4 h-4 text-red-500" />;
    case 'monitoring': return <Eye className="w-4 h-4 text-yellow-500" />;
    case 'resolved': return <CheckCircle className="w-4 h-4 text-green-500" />;
    default: return null;
  }
};

const PestManagement: React.FC = () => {

  const activePests = pests.filter(p => p.status === 'active').length;
  const monitoringPests = pests.filter(p => p.status === 'monitoring').length;
  const resolvedPests = pests.filter(p => p.status === 'resolved').length;

  return (
    <div className="p-6 h-full overflow-y-auto bg-gray-50">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pest Management</h1>
          <p className="text-gray-500 mt-1">Monitor and manage pest threats across your fields</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <Bug className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{activePests}</p>
                <p className="text-sm text-gray-500">Active Threats</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Eye className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{monitoringPests}</p>
                <p className="text-sm text-gray-500">Under Monitoring</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{resolvedPests}</p>
                <p className="text-sm text-gray-500">Resolved</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-100 rounded-lg">
                <Shield className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">87%</p>
                <p className="text-sm text-gray-500">Protection Score</p>
              </div>
            </div>
          </div>
        </div>

        {/* Pest List */}
        <div className="space-y-4">
          {pests.map((pest) => (
            <div 
              key={pest.id}
              className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all ${
                pest.severity === 'critical' ? 'border-red-200' : 'border-gray-100'
              }`}
            >
              <div className="p-5">
                <div className="flex flex-col md:flex-row gap-5">
                  {/* Image */}
                  <div className="w-full md:w-24 h-24 rounded-xl overflow-hidden flex-shrink-0">
                    <img 
                      src={pest.image} 
                      alt={pest.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900">{pest.name}</h3>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getSeverityColor(pest.severity)}`}>
                            {pest.severity}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 italic">{pest.scientificName}</p>
                      </div>
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-lg">
                        {getStatusIcon(pest.status)}
                        <span className="text-sm font-medium text-gray-700 capitalize">{pest.status}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {pest.affectedFields.join(', ')}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {pest.detectedDate}
                      </span>
                      <span className="flex items-center gap-1">
                        <TrendingUp className="w-4 h-4" />
                        {pest.spreadRisk}
                      </span>
                    </div>

                    {/* Affected Crops */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {pest.affectedCrops.map((crop) => (
                        <span key={crop} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs">
                          {crop}
                        </span>
                      ))}
                    </div>

                    {/* Recommended Actions */}
                    {pest.status !== 'resolved' && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-xl">
                        <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1.5">
                          <Zap className="w-4 h-4 text-primary-600" />
                          Recommended Actions
                        </p>
                        <ul className="space-y-1">
                          {pest.actions.map((action, idx) => (
                            <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                              <span className="text-primary-600 mt-1">→</span>
                              {action}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              {pest.status === 'active' && (
                <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex flex-wrap gap-2">
                  <button className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors">
                    Take Action
                  </button>
                  <button className="px-4 py-2 bg-white text-gray-700 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                    View Details
                  </button>
                  <button className="px-4 py-2 text-gray-600 text-sm font-medium hover:text-gray-800 transition-colors">
                    Mark as Resolved
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PestManagement;
