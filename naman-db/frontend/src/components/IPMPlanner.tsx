import React, { useState } from 'react';
import { 
  FileText, 
  Loader2, 
  ChevronDown, 
  ChevronUp,
  Calendar,
  Leaf,
  Beaker,
  Bug,
  Shield,
  Sun,
  Flower2
} from 'lucide-react';
import apiService from '../services/api';
import { useLanguage } from '../context/LanguageContext';

interface IPMStrategy {
  strategy_name?: string;
  risk_assessment?: {
    current_severity: string;
    spread_risk: string;
    yield_impact_if_untreated: string;
  };
  immediate_actions?: Array<{ action: string; timing: string; priority: string }>;
  weekly_plan?: Array<{ week: number; actions: string[]; monitoring: string; expected_outcome: string }>;
  organic_solutions?: Array<{ product: string; application: string; frequency: string; effectiveness: string }>;
  chemical_solutions?: Array<{ product: string; dosage: string; safety_period: string; safety_precautions: string[] }>;
  companion_planting?: Array<{ plant: string; benefit: string; placement: string }>;
  biological_controls?: Array<{ organism: string; target_pest: string; application: string }>;
  prevention_for_next_season?: string[];
  optimal_spray_windows?: Array<{ date: string; quality: string }>;
  raw_strategy?: string;
}

const COMMON_DISEASES = [
  { value: 'late_blight', label: 'Late Blight', crops: ['tomato', 'potato'] },
  { value: 'powdery_mildew', label: 'Powdery Mildew', crops: ['cucumber', 'squash', 'grapes'] },
  { value: 'aphids', label: 'Aphid Infestation', crops: ['all'] },
  { value: 'fall_armyworm', label: 'Fall Armyworm', crops: ['corn', 'rice'] },
  { value: 'bacterial_spot', label: 'Bacterial Spot', crops: ['tomato', 'pepper'] },
  { value: 'rust', label: 'Rust Disease', crops: ['wheat', 'corn'] },
  { value: 'downy_mildew', label: 'Downy Mildew', crops: ['grapes', 'cucumber'] },
  { value: 'root_rot', label: 'Root Rot', crops: ['all'] },
];

const CROPS = [
  'tomato', 'potato', 'corn', 'rice', 'wheat', 
  'cotton', 'cucumber', 'pepper', 'grapes', 'apple'
];

const IPMPlanner: React.FC = () => {
  const { t } = useLanguage();
  const [disease, setDisease] = useState('');
  const [customDisease, setCustomDisease] = useState('');
  const [crop, setCrop] = useState('tomato');
  const [loading, setLoading] = useState(false);
  const [strategy, setStrategy] = useState<IPMStrategy | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<string[]>(['immediate', 'organic']);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  // Get location on mount
  React.useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
        () => console.log('Location not available')
      );
    }
  }, []);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const generateStrategy = async () => {
    const selectedDisease = disease === 'custom' ? customDisease : disease;
    if (!selectedDisease) {
      setError('Please select or enter a disease/pest');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await apiService.generateIPMStrategy(
        selectedDisease,
        crop,
        location?.latitude,
        location?.longitude
      );
      setStrategy(result);
    } catch (err) {
      console.error('Error generating strategy:', err);
      setError('Failed to generate strategy. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-4 sm:p-6 h-full overflow-y-auto bg-transparent">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="glass-card p-6 text-center">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center justify-center gap-2">
            <Shield className="w-7 h-7 text-primary-600" />
            {t('ipmPlanner')}
          </h1>
          <p className="text-gray-600 mt-2">
            {t('ipmDesc')}
          </p>
        </div>

        {/* Form */}
        <div className="glass-card p-6 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('cropType')}
              </label>
              <select
                value={crop}
                onChange={(e) => setCrop(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500"
                title={t('cropType')}
              >
                {CROPS.map(c => (
                  <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('selectDisease')}
              </label>
              <select
                value={disease}
                onChange={(e) => setDisease(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500"
                title={t('selectDisease')}
              >
                <option value="">{t('selectDisease')}</option>
                {COMMON_DISEASES.map(d => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
                <option value="custom">{t('enterDisease')}</option>
              </select>
            </div>
          </div>

          {disease === 'custom' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('enterDisease')}
              </label>
              <input
                type="text"
                value={customDisease}
                onChange={(e) => setCustomDisease(e.target.value)}
                placeholder="e.g., White spots on leaves, small green insects..."
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500"
              />
            </div>
          )}

          <button
            onClick={generateStrategy}
            disabled={loading}
            className="w-full py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {t('generating')}
              </>
            ) : (
              <>
                <FileText className="w-5 h-5" />
                {t('generateStrategy')}
              </>
            )}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
            {error}
          </div>
        )}

        {/* Strategy Results */}
        {strategy && (
          <div className="space-y-4">
            {/* Overview */}
            <div className="glass-card p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                {strategy.strategy_name || 'IPM Strategy'}
              </h2>

              {strategy.risk_assessment && (
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center p-3 bg-white/50 rounded-xl">
                    <p className="text-xs text-gray-500 mb-1">Severity</p>
                    <span className={`px-2 py-1 rounded text-sm font-medium ${getSeverityColor(strategy.risk_assessment.current_severity)}`}>
                      {strategy.risk_assessment.current_severity}
                    </span>
                  </div>
                  <div className="text-center p-3 bg-white/50 rounded-xl">
                    <p className="text-xs text-gray-500 mb-1">Spread Risk</p>
                    <span className={`px-2 py-1 rounded text-sm font-medium ${getSeverityColor(strategy.risk_assessment.spread_risk)}`}>
                      {strategy.risk_assessment.spread_risk}
                    </span>
                  </div>
                  <div className="text-center p-3 bg-white/50 rounded-xl">
                    <p className="text-xs text-gray-500 mb-1">Yield Impact</p>
                    <span className="text-sm font-medium text-gray-700">
                      {strategy.risk_assessment.yield_impact_if_untreated}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Immediate Actions */}
            {strategy.immediate_actions && strategy.immediate_actions.length > 0 && (
              <CollapsibleSection
                title={t('immediateActions')}
                icon={<Bug className="w-5 h-5 text-red-500" />}
                expanded={expandedSections.includes('immediate')}
                onToggle={() => toggleSection('immediate')}
              >
                <div className="space-y-3">
                  {strategy.immediate_actions.map((action, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        action.priority === 'high' ? 'bg-red-200 text-red-800' : 'bg-yellow-200 text-yellow-800'
                      }`}>
                        {action.priority?.toUpperCase()}
                      </span>
                      <div>
                        <p className="font-medium text-gray-800">{action.action}</p>
                        <p className="text-sm text-gray-600">{action.timing}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CollapsibleSection>
            )}

            {/* Weekly Plan */}
            {strategy.weekly_plan && strategy.weekly_plan.length > 0 && (
              <CollapsibleSection
                title={t('weeklyPlan')}
                icon={<Calendar className="w-5 h-5 text-blue-500" />}
                expanded={expandedSections.includes('weekly')}
                onToggle={() => toggleSection('weekly')}
              >
                <div className="space-y-4">
                  {strategy.weekly_plan.map((week, idx) => (
                    <div key={idx} className="border-l-4 border-blue-400 pl-4">
                      <h4 className="font-semibold text-gray-800">{t('week')} {week.week}</h4>
                      <ul className="list-disc list-inside text-gray-600 text-sm mt-1">
                        {week.actions?.map((action, i) => (
                          <li key={i}>{action}</li>
                        ))}
                      </ul>
                      <p className="text-xs text-gray-500 mt-1">
                        Monitor: {week.monitoring}
                      </p>
                    </div>
                  ))}
                </div>
              </CollapsibleSection>
            )}

            {/* Organic Solutions */}
            {strategy.organic_solutions && strategy.organic_solutions.length > 0 && (
              <CollapsibleSection
                title={t('organicSolutions')}
                icon={<Leaf className="w-5 h-5 text-green-500" />}
                expanded={expandedSections.includes('organic')}
                onToggle={() => toggleSection('organic')}
              >
                <div className="space-y-3">
                  {strategy.organic_solutions.map((solution, idx) => (
                    <div key={idx} className="p-3 bg-green-50 rounded-lg">
                      <p className="font-medium text-green-800">{solution.product}</p>
                      <p className="text-sm text-green-700">{solution.application}</p>
                      <div className="flex gap-4 mt-2 text-xs text-green-600">
                        <span>Frequency: {solution.frequency}</span>
                        <span>Effectiveness: {solution.effectiveness}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CollapsibleSection>
            )}

            {/* Chemical Solutions */}
            {strategy.chemical_solutions && strategy.chemical_solutions.length > 0 && (
              <CollapsibleSection
                title={t('chemicalSolutions')}
                icon={<Beaker className="w-5 h-5 text-blue-500" />}
                expanded={expandedSections.includes('chemical')}
                onToggle={() => toggleSection('chemical')}
              >
                <div className="space-y-3">
                  {strategy.chemical_solutions.map((solution, idx) => (
                    <div key={idx} className="p-3 bg-blue-50 rounded-lg">
                      <p className="font-medium text-blue-800">{solution.product}</p>
                      <p className="text-sm text-blue-700">Dosage: {solution.dosage}</p>
                      <p className="text-sm text-blue-600">
                        Wait {solution.safety_period} before harvest
                      </p>
                      {solution.safety_precautions && (
                        <div className="mt-2">
                          <p className="text-xs font-medium text-blue-700">Safety:</p>
                          <ul className="list-disc list-inside text-xs text-blue-600">
                            {solution.safety_precautions.map((p, i) => (
                              <li key={i}>{p}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CollapsibleSection>
            )}

            {/* Companion Planting */}
            {strategy.companion_planting && strategy.companion_planting.length > 0 && (
              <CollapsibleSection
                title={t('companionPlanting')}
                icon={<Flower2 className="w-5 h-5 text-purple-500" />}
                expanded={expandedSections.includes('companion')}
                onToggle={() => toggleSection('companion')}
              >
                <div className="grid md:grid-cols-2 gap-3">
                  {strategy.companion_planting.map((plant, idx) => (
                    <div key={idx} className="p-3 bg-purple-50 rounded-lg">
                      <p className="font-medium text-purple-800">{plant.plant}</p>
                      <p className="text-sm text-purple-700">{plant.benefit}</p>
                      <p className="text-xs text-purple-600 mt-1">{plant.placement}</p>
                    </div>
                  ))}
                </div>
              </CollapsibleSection>
            )}

            {/* Spray Windows */}
            {strategy.optimal_spray_windows && strategy.optimal_spray_windows.length > 0 && (
              <CollapsibleSection
                title={t('sprayWindows')}
                icon={<Sun className="w-5 h-5 text-yellow-500" />}
                expanded={expandedSections.includes('spray')}
                onToggle={() => toggleSection('spray')}
              >
                <div className="flex flex-wrap gap-2">
                  {strategy.optimal_spray_windows.map((window, idx) => (
                    <div 
                      key={idx} 
                      className={`px-3 py-2 rounded-lg ${
                        window.quality === 'excellent' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      <span className="font-medium">{window.date}</span>
                      <span className="text-xs ml-2">({window.quality})</span>
                    </div>
                  ))}
                </div>
              </CollapsibleSection>
            )}

            {/* Prevention */}
            {strategy.prevention_for_next_season && strategy.prevention_for_next_season.length > 0 && (
              <CollapsibleSection
                title={t('preventionNextSeason')}
                icon={<Shield className="w-5 h-5 text-teal-500" />}
                expanded={expandedSections.includes('prevention')}
                onToggle={() => toggleSection('prevention')}
              >
                <ul className="space-y-2">
                  {strategy.prevention_for_next_season.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-teal-700">
                      <Shield className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </CollapsibleSection>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Collapsible Section Component
const CollapsibleSection: React.FC<{
  title: string;
  icon: React.ReactNode;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}> = ({ title, icon, expanded, onToggle, children }) => (
  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
    <button
      onClick={onToggle}
      className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
    >
      <div className="flex items-center gap-3">
        {icon}
        <span className="font-semibold text-gray-800">{title}</span>
      </div>
      {expanded ? (
        <ChevronUp className="w-5 h-5 text-gray-500" />
      ) : (
        <ChevronDown className="w-5 h-5 text-gray-500" />
      )}
    </button>
    {expanded && (
      <div className="px-4 pb-4">
        {children}
      </div>
    )}
  </div>
);

export default IPMPlanner;
