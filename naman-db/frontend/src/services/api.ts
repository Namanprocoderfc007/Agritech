import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Types
export interface ChatResponse {
  status: string;
  session_id: string;
  message: string;
  analysis?: any;
  suggestions?: string[];
  actions_available?: { action: string; label: string }[];
}

export interface WeatherData {
  temperature: number;
  humidity: number;
  wind_speed: number;
  precipitation: number;
  condition: string;
}

export interface DiseaseRisk {
  fungal_disease_risk: string;
  bacterial_disease_risk: string;
  pest_activity_risk: string;
  spray_conditions: string;
  overall_risk_level: string;
  alerts: string[];
  recommendations: string[];
}

export interface AnalysisResult {
  disease_detected: boolean;
  disease_name: string;
  confidence: number;
  urgency_level: string;
  description: string;
  treatment_organic: Record<string, string>;
  treatment_chemical: Record<string, any>;
}

// API Functions
export const apiService = {
  // Health check
  async checkHealth() {
    const response = await api.get('/health');
    return response.data;
  },

  // AI Status
  async getAIStatus() {
    const response = await api.get('/ai-status');
    return response.data;
  },

  // Chat
  async sendMessage(
    message: string,
    sessionId?: string,
    imageBase64?: string,
    location?: { latitude: number; longitude: number },
    cropType?: string,
    language?: string
  ): Promise<ChatResponse> {
    const response = await api.post('/chat/message', {
      message,
      session_id: sessionId,
      image_base64: imageBase64,
      latitude: location?.latitude,
      longitude: location?.longitude,
      crop_type: cropType,
      language: language || 'en-US',
    });
    return response.data;
  },

  async sendMessageWithImage(
    message: string,
    file: File,
    sessionId?: string,
    location?: { latitude: number; longitude: number },
    cropType?: string,
    language?: string
  ): Promise<ChatResponse> {
    const formData = new FormData();
    formData.append('message', message);
    formData.append('file', file);
    formData.append('language', language || 'en-US');
    if (sessionId) formData.append('session_id', sessionId);
    if (location) {
      formData.append('latitude', location.latitude.toString());
      formData.append('longitude', location.longitude.toString());
    }
    if (cropType) formData.append('crop_type', cropType);

    const response = await api.post('/chat/message/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async getIPMStrategy(
    sessionId: string,
    disease: string,
    crop: string,
    location?: { latitude: number; longitude: number }
  ) {
    const response = await api.post('/chat/ipm-strategy', {
      session_id: sessionId,
      disease,
      crop,
      latitude: location?.latitude,
      longitude: location?.longitude,
    });
    return response.data;
  },

  // Analysis
  async analyzeLeaf(file: File, cropType?: string, context?: string, language?: string) {
    const formData = new FormData();
    formData.append('file', file);
    if (cropType) formData.append('crop_type', cropType);
    if (context) formData.append('context', context);
    if (language) formData.append('language', language);

    const response = await api.post('/analysis/leaf/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async quickDiagnosis(file: File, question: string) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('question', question);

    const response = await api.post('/analysis/quick', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Weather
  async getCurrentWeather(latitude: number, longitude: number): Promise<WeatherData> {
    const response = await api.get('/weather/current', {
      params: { latitude, longitude },
    });
    return response.data.data;
  },

  async getDiseaseRisk(latitude: number, longitude: number) {
    const response = await api.get('/weather/disease-risk', {
      params: { latitude, longitude },
    });
    return response.data.data;
  },

  async getForecast(latitude: number, longitude: number, days: number = 7) {
    const response = await api.get('/weather/forecast', {
      params: { latitude, longitude, days },
    });
    return response.data.data;
  },

  async getSprayWindows(latitude: number, longitude: number) {
    const response = await api.get('/weather/spray-windows', {
      params: { latitude, longitude },
    });
    return response.data.data;
  },

  // IPM
  async generateIPMStrategy(
    disease: string,
    crop: string,
    latitude?: number,
    longitude?: number,
    context?: string
  ) {
    const response = await api.post('/ipm/strategy', {
      disease,
      crop,
      latitude,
      longitude,
      context,
    });
    return response.data.data;
  },

  async getQuickRecommendation(disease: string, crop: string = 'general') {
    const response = await api.get(`/ipm/quick/${disease}`, {
      params: { crop },
    });
    return response.data;
  },

  async predictOutbreak(latitude: number, longitude: number, crop: string = 'general') {
    const response = await api.get('/ipm/predict-outbreak', {
      params: { latitude, longitude, crop },
    });
    return response.data.data;
  },

  // Advisory
  async generateSchedule(crop: string, sowingDate: string, soilN: number, soilP: number, soilK: number, latitude?: number, longitude?: number) {
    const response = await api.post('/advisory/schedule', {
      crop,
      sowing_date: sowingDate,
      soil_n: soilN,
      soil_p: soilP,
      soil_k: soilK,
      latitude,
      longitude
    });
    return response.data.data;
  },

  // Market Prices
  async getMarketPrices(crop: string, quantity: number, lat?: number, lon?: number) {
    const response = await api.get('/market/prices', {
      params: { crop, quantity, lat, lon }
    });
    return response.data.data;
  },

  // SMS/WhatsApp Alerts (Demo)
  async sendSMSAlert(phoneNumber: string, alertType: string, crop: string, condition: string, isWhatsApp: boolean = false) {
    const response = await api.post('/sms/send', {
      phone_number: phoneNumber,
      alert_type: alertType,
      crop: crop,
      condition_or_pest: condition,
      is_whatsapp: isWhatsApp
    });
    return response.data.data;
  },

  // Dashboard Data
  async getDashboardData() {
    const response = await api.get('/dashboard/');
    return response.data.data;
  },

  async getDiseaseDatabase() {
    const response = await api.get('/ipm/database');
    return response.data;
  },
};

export default apiService;
