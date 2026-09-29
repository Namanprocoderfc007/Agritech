import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

// Supported languages with their codes for speech recognition/synthesis
export const LANGUAGES = [
  { code: 'en-US', name: 'English', flag: '🇺🇸', greeting: "Hello! I'm AgriGuard, your AI Agronomist 🌱" },
  { code: 'hi-IN', name: 'हिंदी', flag: '🇮🇳', greeting: "नमस्ते! मैं एग्रीगार्ड हूं, आपका AI कृषि विशेषज्ञ 🌱" },
  { code: 'es-ES', name: 'Español', flag: '🇪🇸', greeting: "¡Hola! Soy AgriGuard, tu Agrónomo IA 🌱" },
  { code: 'fr-FR', name: 'Français', flag: '🇫🇷', greeting: "Bonjour! Je suis AgriGuard, votre Agronome IA 🌱" },
  { code: 'pt-BR', name: 'Português', flag: '🇧🇷', greeting: "Olá! Sou AgriGuard, seu Agrônomo IA 🌱" },
  { code: 'de-DE', name: 'Deutsch', flag: '🇩🇪', greeting: "Hallo! Ich bin AgriGuard, Ihr KI-Agronom 🌱" },
  { code: 'zh-CN', name: '中文', flag: '🇨🇳', greeting: "你好！我是AgriGuard，您的AI农艺师 🌱" },
  { code: 'ar-SA', name: 'العربية', flag: '🇸🇦', greeting: "مرحبا! أنا AgriGuard، مهندسك الزراعي AI 🌱" },
  { code: 'bn-IN', name: 'বাংলা', flag: '🇮🇳', greeting: "নমস্কার! আমি এগ্রিগার্ড, আপনার AI কৃষি বিশেষজ্ঞ 🌱" },
  { code: 'ta-IN', name: 'தமிழ்', flag: '🇮🇳', greeting: "வணக்கம்! நான் AgriGuard, உங்கள் AI வேளாண் நிபுணர் 🌱" },
  { code: 'te-IN', name: 'తెలుగు', flag: '🇮🇳', greeting: "నమస్కారం! నేను AgriGuard, మీ AI వ్యవసాయ నిపుణుడు 🌱" },
  { code: 'mr-IN', name: 'मराठी', flag: '🇮🇳', greeting: "नमस्कार! मी AgriGuard, तुमचा AI कृषी तज्ञ 🌱" },
  { code: 'gu-IN', name: 'ગુજરાતી', flag: '🇮🇳', greeting: "નમસ્તે! હું AgriGuard છું, તમારો AI કૃષિ નિષ્ણાત 🌱" },
  { code: 'kn-IN', name: 'ಕನ್ನಡ', flag: '🇮🇳', greeting: "ನಮಸ್ಕಾರ! ನಾನು AgriGuard, ನಿಮ್ಮ AI ಕೃಷಿ ತಜ್ಞ 🌱" },
  { code: 'pa-IN', name: 'ਪੰਜਾਬੀ', flag: '🇮🇳', greeting: "ਸਤ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ AgriGuard ਹਾਂ, ਤੁਹਾਡਾ AI ਖੇਤੀ ਮਾਹਰ 🌱" },
];

// Comprehensive translations for all components
export const TRANSLATIONS: Record<string, Record<string, string>> = {
  'en-US': {
    // Common
    appName: 'AgriGuard',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    submit: 'Submit',
    cancel: 'Cancel',
    close: 'Close',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    view: 'View',
    back: 'Back',
    next: 'Next',
    search: 'Search',
    filter: 'Filter',
    
    // Navigation
    dashboard: 'Dashboard',
    chat: 'Chat',
    scanner: 'Scanner',
    weather: 'Weather',
    ipm: 'IPM Strategy',
    advisory: 'Advisory',
    market: 'Mandi Prices',
    agent: 'AI Agent',
    
    // Agent
    suggestedQ1: "What should I do about the corn earworm in Field A?",
    suggestedQ2: "How can I improve soil moisture in Field B?",
    suggestedQ3: "What's the best time to harvest my corn?",
    suggestedQ4: "Explain integrated pest management strategies",
    suggestedQ5: "Should I irrigate today based on weather conditions?",
    suggestedQ6: "What fertilizer should I use for my wheat crop?",
    suggestedQ7: "How do I prevent late blight in tomatoes?",
    suggestedQ8: "What are the signs of nitrogen deficiency?",
    agentGreeting: "👋 Hello! I'm your AgriGuard AI assistant. I've analyzed your farm data and I'm ready to help optimize your operations.\n\nI can assist with crop health, pest management, irrigation scheduling, and harvest planning. What would you like to discuss today?",
    
    // Chat
    helpWith: "I can help you with:",
    diagnose: "Diagnosing plant diseases (upload a photo)",
    weatherAdvice: "Weather-based farming advice",
    pest: "Creating pest management plans",
    voice: "Voice commands (click the mic!)",
    tips: "General farming tips",
    askMe: "How can I help you today?",
    listening: "Listening... speak now",
    placeholder: "Ask about plant diseases, weather, farming tips...",
    weatherRisk: "Weather Risk",
    scanPlant: "Scan Plant",
    diseaseGuide: "Disease Guide",
    voiceCommand: "Voice Command",
    speakQuestion: "Listening... speak your question",
    analyzing: "Analyzing...",
    connectionError: "I'm having trouble connecting to the server.",
    
    // Plant Scanner
    plantScanner: "Plant Disease Scanner",
    scannerDesc: "Upload a photo of your plant to detect diseases and get treatment recommendations",
    uploadImage: "Upload Image",
    takePhoto: "Take Photo",
    dragDrop: "Drag and drop an image here, or click to select",
    supportedFormats: "Supported formats: JPG, PNG, WebP",
    selectCrop: "Select Crop Type",
    optional: "Optional",
    analyzeImage: "Analyze Image",
    resetScan: "Reset & Scan Again",
    diseaseDetected: "Disease Detected",
    healthy: "Healthy",
    confidence: "Confidence",
    urgency: "Urgency Level",
    symptoms: "Symptoms",
    organicTreatment: "Organic Treatment",
    chemicalTreatment: "Chemical Treatment",
    prevention: "Prevention Tips",
    getIPMStrategy: "Get Full IPM Strategy",
    
    // Weather Dashboard
    weatherDashboard: "Weather Dashboard",
    currentConditions: "Current Conditions",
    temperature: "Temperature",
    humidity: "Humidity",
    windSpeed: "Wind Speed",
    conditions: "Conditions",
    forecast: "7-Day Forecast",
    diseaseRiskTitle: "Disease Risk Assessment",
    fungalRisk: "Fungal Disease Risk",
    bacterialRisk: "Bacterial Disease Risk",
    pestRisk: "Pest Activity Risk",
    sprayConditions: "Spray Conditions",
    sprayWindows: "Optimal Spray Windows",
    alerts: "Weather Alerts",
    refreshWeather: "Refresh Weather",
    locationRequired: "Location Required",
    enableLocation: "Please enable location access to get weather data",
    
    // IPM Planner
    ipmPlanner: "IPM Strategy Planner",
    ipmDesc: "Generate a comprehensive Integrated Pest Management strategy",
    selectDisease: "Select Disease/Pest",
    enterDisease: "Or enter disease name",
    cropType: "Crop Type",
    generateStrategy: "Generate IPM Strategy",
    generating: "Generating Strategy...",
    immediateActions: "Immediate Actions",
    weeklyPlan: "Weekly Plan",
    organicSolutions: "Organic Solutions",
    chemicalSolutions: "Chemical Solutions",
    companionPlanting: "Companion Planting",
    biologicalControls: "Biological Controls",
    culturalPractices: "Cultural Practices",
    monitoring: "Monitoring Schedule",
    preventionNextSeason: "Prevention for Next Season",
    successMetrics: "Success Metrics",
    week: "Week",
    
    // Dashboard Additional
    fieldAnalytics: "Field Analytics",
    dataDriven: "Data-driven insights for precision agriculture",
    refreshSensors: "Refresh Sensors",
    liveSensorData: "Live Sensor Data",
    avgYieldIndex: "Average Yield Index",
    comparedLastMonth: "Compared to last month",
    waterEfficiency: "Water Efficiency",
    irrigationOpt: "Irrigation optimization",
    soilHealthScore: "Soil Health Score",
    currentAggScore: "Current aggregated score",
    yieldPerfTrends: "Yield Performance Trends",
    monthlyYieldIndex: "Monthly yield index across all fields",
    soilHealthParams: "Soil Health Parameters",
    currentVsOptimal: "Current vs. optimal levels",
    
    // Risk Levels
    low: "Low",
    medium: "Medium",
    high: "High",
    critical: "Critical",
    good: "Good",
    moderate: "Moderate",
    poor: "Poor",
    excellent: "Excellent",
    
    // Weather Additional
    loadingWeather: "Loading weather data...",
    failedWeather: "Failed to fetch weather data. Make sure the backend is running.",
    tryAgain: "Try again",
    locationUnavailable: "Location unavailable",
    currentWeather: "Current Weather",
    wind: "Wind",
    rain: "Rain",
    overallRisk: "Overall Risk",
    fungalDisease: "Fungal Disease",
    pestActivity: "Pest Activity",
    recommendations: "Recommendations",
    noSprayWindows: "No optimal spray windows found in the forecast period.",
  },
  
  'hi-IN': {
    // Common
    appName: 'एग्रीगार्ड',
    loading: 'लोड हो रहा है...',
    error: 'त्रुटि',
    success: 'सफलता',
    submit: 'जमा करें',
    cancel: 'रद्द करें',
    close: 'बंद करें',
    save: 'सहेजें',
    delete: 'हटाएं',
    edit: 'संपादित करें',
    view: 'देखें',
    back: 'वापस',
    next: 'अगला',
    search: 'खोजें',
    filter: 'फ़िल्टर',
    
    // Navigation
    dashboard: 'डैशबोर्ड',
    chat: 'चैट',
    scanner: 'स्कैनर',
    weather: 'मौसम',
    ipm: 'IPM रणनीति',
    advisory: 'सलाह',
    market: 'मंडी भाव',
    agent: 'AI एजेंट',
    
    // Agent
    suggestedQ1: "फील्ड A में मकई के कीड़े के बारे में मुझे क्या करना चाहिए?",
    suggestedQ2: "मैं फील्ड B में मिट्टी की नमी कैसे सुधार सकता हूँ?",
    suggestedQ3: "मेरी मकई की कटाई का सबसे अच्छा समय क्या है?",
    suggestedQ4: "एकीकृत कीट प्रबंधन रणनीतियों (IPM) को समझाएं",
    suggestedQ5: "क्या मुझे मौसम की स्थिति के आधार पर आज सिंचाई करनी चाहिए?",
    suggestedQ6: "मुझे अपनी गेहूं की फसल के लिए किस उर्वरक का उपयोग करना चाहिए?",
    suggestedQ7: "मैं टमाटर में लेट ब्लाइट को कैसे रोकूँ?",
    suggestedQ8: "नाइट्रोजन की कमी के संकेत क्या हैं?",
    agentGreeting: "👋 नमस्ते! मैं आपका एग्रीगार्ड AI सहायक हूँ। मैंने आपके फार्म डेटा का विश्लेषण किया है और मैं आपके काम को अनुकूलित करने में मदद करने के लिए तैयार हूँ।\n\nमैं फसल स्वास्थ्य, कीट प्रबंधन, सिंचाई शेड्यूलिंग और फसल कटाई योजना में सहायता कर सकता हूँ। आज आप किस विषय पर चर्चा करना चाहेंगे?",
    
    // Chat
    helpWith: "मैं आपकी मदद कर सकता हूं:",
    diagnose: "पौधों की बीमारियों का निदान (फोटो अपलोड करें)",
    weatherAdvice: "मौसम आधारित खेती की सलाह",
    pest: "कीट प्रबंधन योजनाएं",
    voice: "वॉइस कमांड (माइक पर क्लिक करें!)",
    tips: "सामान्य खेती के टिप्स",
    askMe: "आज मैं आपकी कैसे मदद कर सकता हूं?",
    listening: "सुन रहा हूं... अब बोलें",
    placeholder: "पौधों की बीमारी, मौसम, खेती के बारे में पूछें...",
    weatherRisk: "मौसम जोखिम",
    scanPlant: "पौधा स्कैन",
    diseaseGuide: "रोग गाइड",
    voiceCommand: "वॉइस कमांड",
    speakQuestion: "सुन रहा हूं... अपना सवाल बोलें",
    analyzing: "विश्लेषण हो रहा है...",
    connectionError: "सर्वर से कनेक्ट करने में समस्या है।",
    
    // Plant Scanner
    plantScanner: "पौधा रोग स्कैनर",
    scannerDesc: "रोगों का पता लगाने और उपचार की सिफारिशें प्राप्त करने के लिए अपने पौधे की फोटो अपलोड करें",
    uploadImage: "छवि अपलोड करें",
    takePhoto: "फोटो लें",
    dragDrop: "यहां एक छवि खींचें और छोड़ें, या चुनने के लिए क्लिक करें",
    supportedFormats: "समर्थित प्रारूप: JPG, PNG, WebP",
    selectCrop: "फसल का प्रकार चुनें",
    optional: "वैकल्पिक",
    analyzeImage: "छवि का विश्लेषण करें",
    resetScan: "रीसेट और फिर से स्कैन करें",
    diseaseDetected: "रोग का पता चला",
    healthy: "स्वस्थ",
    confidence: "विश्वास स्तर",
    urgency: "तात्कालिकता स्तर",
    symptoms: "लक्षण",
    organicTreatment: "जैविक उपचार",
    chemicalTreatment: "रासायनिक उपचार",
    prevention: "रोकथाम के उपाय",
    getIPMStrategy: "पूर्ण IPM रणनीति प्राप्त करें",
    
    // Weather Dashboard
    weatherDashboard: "मौसम डैशबोर्ड",
    currentConditions: "वर्तमान स्थितियां",
    temperature: "तापमान",
    humidity: "आर्द्रता",
    windSpeed: "हवा की गति",
    conditions: "स्थितियां",
    forecast: "7-दिन का पूर्वानुमान",
    diseaseRiskTitle: "रोग जोखिम मूल्यांकन",
    fungalRisk: "फफूंद रोग जोखिम",
    bacterialRisk: "जीवाणु रोग जोखिम",
    pestRisk: "कीट गतिविधि जोखिम",
    sprayConditions: "छिड़काव की स्थिति",
    sprayWindows: "इष्टतम छिड़काव समय",
    alerts: "मौसम अलर्ट",
    refreshWeather: "मौसम रीफ्रेश करें",
    locationRequired: "स्थान आवश्यक",
    enableLocation: "मौसम डेटा प्राप्त करने के लिए कृपया स्थान पहुंच सक्षम करें",
    
    // IPM Planner
    ipmPlanner: "IPM रणनीति योजनाकार",
    ipmDesc: "एक व्यापक एकीकृत कीट प्रबंधन रणनीति तैयार करें",
    selectDisease: "रोग/कीट चुनें",
    enterDisease: "या रोग का नाम दर्ज करें",
    cropType: "फसल का प्रकार",
    generateStrategy: "IPM रणनीति बनाएं",
    generating: "रणनीति बनाई जा रही है...",
    immediateActions: "तत्काल कार्रवाई",
    weeklyPlan: "साप्ताहिक योजना",
    organicSolutions: "जैविक समाधान",
    chemicalSolutions: "रासायनिक समाधान",
    companionPlanting: "सहयोगी रोपण",
    biologicalControls: "जैविक नियंत्रण",
    culturalPractices: "सांस्कृतिक प्रथाएं",
    monitoring: "निगरानी अनुसूची",
    preventionNextSeason: "अगले सीजन के लिए रोकथाम",
    successMetrics: "सफलता मापदंड",
    week: "सप्ताह",
    
    // Dashboard Additional
    fieldAnalytics: "फील्ड एनालिटिक्स",
    dataDriven: "सटीक कृषि के लिए डेटा-संचालित अंतर्दृष्टि",
    refreshSensors: "सेंसर रीफ्रेश करें",
    liveSensorData: "लाइव सेंसर डेटा",
    avgYieldIndex: "औसत उपज सूचकांक",
    comparedLastMonth: "पिछले महीने की तुलना में",
    waterEfficiency: "जल दक्षता",
    irrigationOpt: "सिंचाई अनुकूलन",
    soilHealthScore: "मृदा स्वास्थ्य स्कोर",
    currentAggScore: "वर्तमान कुल स्कोर",
    yieldPerfTrends: "उपज प्रदर्शन रुझान",
    monthlyYieldIndex: "सभी खेतों में मासिक उपज सूचकांक",
    soilHealthParams: "मृदा स्वास्थ्य पैरामीटर",
    currentVsOptimal: "वर्तमान बनाम इष्टतम स्तर",
    
    // Risk Levels
    low: "कम",
    medium: "मध्यम",
    high: "उच्च",
    critical: "गंभीर",
    good: "अच्छा",
    moderate: "मध्यम",
    poor: "खराब",
    excellent: "उत्कृष्ट",
    
    // Weather Additional
    loadingWeather: "मौसम डेटा लोड हो रहा है...",
    failedWeather: "मौसम डेटा प्राप्त करने में विफल। सुनिश्चित करें कि बैकएंड चल रहा है।",
    tryAgain: "फिर से कोशिश करें",
    locationUnavailable: "स्थान उपलब्ध नहीं",
    currentWeather: "वर्तमान मौसम",
    wind: "हवा",
    rain: "बारिश",
    overallRisk: "समग्र जोखिम",
    fungalDisease: "फफूंद रोग",
    pestActivity: "कीट गतिविधि",
    recommendations: "सिफारिशें",
    noSprayWindows: "पूर्वानुमान अवधि में कोई इष्टतम छिड़काव समय नहीं मिला।",
  },
  
  'es-ES': {
    // Common
    appName: 'AgriGuard',
    loading: 'Cargando...',
    error: 'Error',
    success: 'Éxito',
    submit: 'Enviar',
    cancel: 'Cancelar',
    close: 'Cerrar',
    save: 'Guardar',
    delete: 'Eliminar',
    edit: 'Editar',
    view: 'Ver',
    back: 'Atrás',
    next: 'Siguiente',
    search: 'Buscar',
    filter: 'Filtrar',
    
    // Navigation
    chat: 'Chat',
    scanner: 'Escáner',
    weather: 'Clima',
    ipm: 'MIP',
    
    // Chat
    helpWith: "Puedo ayudarte con:",
    diagnose: "Diagnóstico de enfermedades de plantas (sube una foto)",
    weatherAdvice: "Consejos agrícolas basados en el clima",
    pest: "Planes de manejo de plagas",
    voice: "Comandos de voz (¡haz clic en el micrófono!)",
    tips: "Consejos generales de agricultura",
    askMe: "¿Cómo puedo ayudarte hoy?",
    listening: "Escuchando... habla ahora",
    placeholder: "Pregunta sobre enfermedades, clima, agricultura...",
    weatherRisk: "Riesgo Climático",
    scanPlant: "Escanear Planta",
    diseaseGuide: "Guía de Enfermedades",
    voiceCommand: "Comando de Voz",
    speakQuestion: "Escuchando... haz tu pregunta",
    analyzing: "Analizando...",
    connectionError: "Tengo problemas para conectar con el servidor.",
    
    // Plant Scanner
    plantScanner: "Escáner de Enfermedades de Plantas",
    scannerDesc: "Sube una foto de tu planta para detectar enfermedades y obtener recomendaciones de tratamiento",
    uploadImage: "Subir Imagen",
    takePhoto: "Tomar Foto",
    dragDrop: "Arrastra y suelta una imagen aquí, o haz clic para seleccionar",
    supportedFormats: "Formatos soportados: JPG, PNG, WebP",
    selectCrop: "Seleccionar Tipo de Cultivo",
    optional: "Opcional",
    analyzeImage: "Analizar Imagen",
    resetScan: "Reiniciar y Escanear de Nuevo",
    diseaseDetected: "Enfermedad Detectada",
    healthy: "Saludable",
    confidence: "Confianza",
    urgency: "Nivel de Urgencia",
    symptoms: "Síntomas",
    organicTreatment: "Tratamiento Orgánico",
    chemicalTreatment: "Tratamiento Químico",
    prevention: "Consejos de Prevención",
    getIPMStrategy: "Obtener Estrategia MIP Completa",
    
    // Weather Dashboard
    weatherDashboard: "Panel del Clima",
    currentConditions: "Condiciones Actuales",
    temperature: "Temperatura",
    humidity: "Humedad",
    windSpeed: "Velocidad del Viento",
    conditions: "Condiciones",
    forecast: "Pronóstico de 7 Días",
    diseaseRiskTitle: "Evaluación de Riesgo de Enfermedades",
    fungalRisk: "Riesgo de Enfermedades Fúngicas",
    bacterialRisk: "Riesgo de Enfermedades Bacterianas",
    pestRisk: "Riesgo de Actividad de Plagas",
    sprayConditions: "Condiciones de Pulverización",
    sprayWindows: "Ventanas Óptimas de Pulverización",
    alerts: "Alertas Meteorológicas",
    refreshWeather: "Actualizar Clima",
    locationRequired: "Ubicación Requerida",
    enableLocation: "Por favor, habilita el acceso a la ubicación para obtener datos del clima",
    
    // IPM Planner
    ipmPlanner: "Planificador de Estrategia MIP",
    ipmDesc: "Genera una estrategia integral de Manejo Integrado de Plagas",
    selectDisease: "Seleccionar Enfermedad/Plaga",
    enterDisease: "O ingresa el nombre de la enfermedad",
    cropType: "Tipo de Cultivo",
    generateStrategy: "Generar Estrategia MIP",
    generating: "Generando Estrategia...",
    immediateActions: "Acciones Inmediatas",
    weeklyPlan: "Plan Semanal",
    organicSolutions: "Soluciones Orgánicas",
    chemicalSolutions: "Soluciones Químicas",
    companionPlanting: "Plantas Compañeras",
    biologicalControls: "Controles Biológicos",
    culturalPractices: "Prácticas Culturales",
    monitoring: "Programa de Monitoreo",
    preventionNextSeason: "Prevención para la Próxima Temporada",
    successMetrics: "Métricas de Éxito",
    week: "Semana",
    
    // Risk Levels
    low: "Bajo",
    medium: "Medio",
    high: "Alto",
    critical: "Crítico",
    good: "Bueno",
    moderate: "Moderado",
    poor: "Malo",
    excellent: "Excelente",
    
    // Weather Additional
    loadingWeather: "Cargando datos del clima...",
    failedWeather: "Error al obtener datos del clima. Asegúrate de que el backend esté funcionando.",
    tryAgain: "Intentar de nuevo",
    locationUnavailable: "Ubicación no disponible",
    currentWeather: "Clima Actual",
    wind: "Viento",
    rain: "Lluvia",
    overallRisk: "Riesgo General",
    fungalDisease: "Enfermedad Fúngica",
    pestActivity: "Actividad de Plagas",
    recommendations: "Recomendaciones",
    noSprayWindows: "No se encontraron ventanas de pulverización óptimas en el período de pronóstico.",
  },
};

interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string) => string;
  getCurrentLanguage: () => typeof LANGUAGES[0];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState(() => {
    // Try to get saved language from localStorage
    if (typeof window !== 'undefined') {
      return localStorage.getItem('agriguard-language') || 'en-US';
    }
    return 'en-US';
  });

  const setLanguage = useCallback((lang: string) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('agriguard-language', lang);
      
      // Update Google Translate widget
      const gtCodeMap: Record<string, string> = {
        'en-US': 'en',
        'hi-IN': 'hi',
        'es-ES': 'es',
        'fr-FR': 'fr',
        'pt-BR': 'pt',
        'de-DE': 'de',
        'zh-CN': 'zh-CN',
        'ar-SA': 'ar',
        'bn-IN': 'bn',
        'ta-IN': 'ta',
        'te-IN': 'te',
        'mr-IN': 'mr',
        'gu-IN': 'gu',
        'kn-IN': 'kn',
        'pa-IN': 'pa'
      };
      
      const targetLang = gtCodeMap[lang] || 'en';
      
      // We set the cookie that Google Translate looks for
      document.cookie = `googtrans=/en/${targetLang}; path=/`;
      document.cookie = `googtrans=/en/${targetLang}; domain=${window.location.hostname}; path=/`;
      
      // We force a reload so the entire app (all static text, dropdowns, AI text) is immediately translated
      window.location.reload();
    }
  }, []);

  const t = useCallback((key: string): string => {
    // Get base language code (e.g., 'en' from 'en-US')
    const baseLang = language.split('-')[0];
    
    // Try exact match first, then base language, then English
    const translations = TRANSLATIONS[language] || 
                        TRANSLATIONS[`${baseLang}-${baseLang.toUpperCase()}`] ||
                        TRANSLATIONS['en-US'];
    
    return translations[key] || TRANSLATIONS['en-US'][key] || key;
  }, [language]);

  const getCurrentLanguage = useCallback(() => {
    return LANGUAGES.find(l => l.code === language) || LANGUAGES[0];
  }, [language]);

  useEffect(() => {
    // Save language preference
    if (typeof window !== 'undefined') {
      localStorage.setItem('agriguard-language', language);
    }
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, getCurrentLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export default LanguageContext;
