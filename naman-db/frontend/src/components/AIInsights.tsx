import React, { useState } from 'react';
import { 
  Sparkles, 
  Lightbulb,
  CheckCircle,
  DollarSign,
  AlertTriangle,
  Clock,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Droplets,
  Bug,
  Leaf,
  Zap
} from 'lucide-react';
// Language context available for translations

interface Insight {
  id: string;
  title: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  description: string;
  impact: string;
  estimatedSavings: string;
  actions: string[];
  status: 'pending' | 'implemented' | 'dismissed';
  icon: React.ReactNode;
}

const insights: Insight[] = [
  {
    id: '1',
    title: 'Optimize Irrigation Schedule for Field B',
    category: 'Water Management',
    priority: 'high',
    description: "AI analysis indicates soil moisture levels in Field B are suboptimal. Current irrigation timing doesn't align with crop water stress patterns detected via multispectral imaging.",
    impact: 'Reduce water usage by 15% while improving crop yield by 8%',
    estimatedSavings: '$2,400/season',
    actions: [
      'Shift irrigation to early morning (5:00-7:00 AM)',
      'Reduce duration from 45 to 35 minutes per cycle',
      'Increase frequency from every 3 days to every 2 days',
      'Monitor soil moisture sensors daily'
    ],
    status: 'pending',
    icon: <Droplets className="w-5 h-5 text-blue-600" />
  },
  {
    id: '2',
    title: 'Early Pest Detection in Corn Fields',
    category: 'Pest Control',
    priority: 'high',
    description: 'Machine learning models detected early signs of armyworm activity in Field A based on leaf damage patterns and environmental conditions.',
    impact: 'Prevent potential 25% yield loss through early intervention',
    estimatedSavings: '$4,200/season',
    actions: [
      'Deploy pheromone traps in affected zones',
      'Apply targeted Bt-based treatment within 48 hours',
      'Increase scouting frequency to daily',
      'Set up early warning alerts for adjacent fields'
    ],
    status: 'pending',
    icon: <Bug className="w-5 h-5 text-red-600" />
  },
  {
    id: '3',
    title: 'Nutrient Deficiency Correction',
    category: 'Soil Health',
    priority: 'medium',
    description: 'Nitrogen levels in Field C are 15% below optimal. Foliar feeding recommended to address deficiency before it impacts soybean pod development.',
    impact: 'Improve nitrogen uptake efficiency and yield potential',
    estimatedSavings: '$1,800/season',
    actions: [
      'Apply foliar nitrogen spray (3% urea solution)',
      'Schedule application for early morning or late evening',
      'Retest soil nitrogen levels in 2 weeks',
      'Consider cover cropping for next season'
    ],
    status: 'implemented',
    icon: <Leaf className="w-5 h-5 text-green-600" />
  },
  {
    id: '4',
    title: 'Energy Optimization for Equipment',
    category: 'Operations',
    priority: 'low',
    description: 'Analysis of equipment usage patterns suggests potential for 12% fuel savings through optimized route planning and operation scheduling.',
    impact: 'Reduce operational costs and carbon footprint',
    estimatedSavings: '$500/season',
    actions: [
      'Implement GPS-guided route optimization',
      'Schedule equipment maintenance during off-peak hours',
      'Consider equipment sharing for underutilized machinery'
    ],
    status: 'dismissed',
    icon: <Zap className="w-5 h-5 text-yellow-600" />
  }
];

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high': return 'bg-red-500 text-white';
    case 'medium': return 'bg-yellow-500 text-white';
    case 'low': return 'bg-green-500 text-white';
    default: return 'bg-gray-500 text-white';
  }
};

const InsightCard: React.FC<{ insight: Insight }> = ({ insight }) => {
  const [expanded, setExpanded] = useState(insight.priority === 'high');

  return (
    <div className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${
      insight.priority === 'high' ? 'border-l-4 border-l-red-500' : 'border-gray-100'
    }`}>
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="font-semibold text-gray-900">{insight.title}</h3>
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${getPriorityColor(insight.priority)}`}>
                {insight.priority}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs">
                {insight.category}
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-green-600">{insight.estimatedSavings}</p>
            <p className="text-xs text-gray-500">Est. benefit</p>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm mt-4">{insight.description}</p>

        {/* Impact */}
        <div className="mt-4 p-3 bg-blue-50 rounded-xl border border-blue-100">
          <p className="text-sm font-medium text-blue-800 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Expected Impact
          </p>
          <p className="text-sm text-blue-700 mt-1">{insight.impact}</p>
        </div>

        {/* Recommended Actions */}
        <div className="mt-4">
          <button 
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            <Clock className="w-4 h-4" />
            Recommended Actions
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          
          {expanded && (
            <ul className="mt-3 space-y-2">
              {insight.actions.map((action, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                  <ArrowRight className="w-4 h-4 mt-0.5 text-primary-600 flex-shrink-0" />
                  {action}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Action Bar */}
      {insight.status === 'pending' && (
        <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex flex-wrap gap-2">
          <button className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Implement Recommendation
          </button>
          <button className="px-4 py-2 bg-white text-gray-700 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
            View Details
          </button>
          <button className="px-4 py-2 text-gray-600 text-sm font-medium hover:text-gray-800 transition-colors">
            Dismiss
          </button>
        </div>
      )}

      {insight.status === 'implemented' && (
        <div className="px-5 py-3 bg-green-50 border-t border-green-100 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-green-600" />
          <span className="text-sm font-medium text-green-700">Implemented</span>
        </div>
      )}
    </div>
  );
};

const AIInsights: React.FC = () => {

  const activeInsights = insights.filter(i => i.status === 'pending').length;
  const highPriority = insights.filter(i => i.priority === 'high' && i.status === 'pending').length;
  const implemented = insights.filter(i => i.status === 'implemented').length;
  const totalSavings = '$8.9K';

  return (
    <div className="p-6 h-full overflow-y-auto bg-gray-50">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Sparkles className="w-7 h-7 text-primary-600" />
            AI-Powered Insights
          </h1>
          <p className="text-gray-500 mt-1">Smart recommendations based on real-time data analysis and predictive models</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-gray-600">Active Recommendations</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{activeInsights}</p>
            <p className="text-xs text-gray-500 mt-1">Actionable insights</p>
          </div>
          <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span className="text-sm text-gray-600">High Priority</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{highPriority}</p>
            <p className="text-xs text-gray-500 mt-1">Immediate action needed</p>
          </div>
          <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm text-gray-600">Implemented</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{implemented}</p>
            <p className="text-xs text-gray-500 mt-1">This month</p>
          </div>
          <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-green-600" />
              <span className="text-sm text-gray-600">Estimated Savings</span>
            </div>
            <p className="text-3xl font-bold text-green-600">{totalSavings}</p>
            <p className="text-xs text-gray-500 mt-1">Potential this season</p>
          </div>
        </div>

        {/* Insights List */}
        <div className="space-y-4">
          {insights.filter(i => i.status !== 'dismissed').map((insight) => (
            <InsightCard key={insight.id} insight={insight} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AIInsights;
