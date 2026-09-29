import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Upload, Leaf, Sun, Bug, X, Image as ImageIcon, Mic, MicOff, Volume2, VolumeX, Globe } from 'lucide-react';
import apiService, { ChatResponse } from '../services/api';

// Speech Recognition types
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: Event) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  image?: string;
  analysis?: any;
  suggestions?: string[];
  actions?: { action: string; label: string }[];
  timestamp: Date;
}

// Supported languages with their codes for speech recognition/synthesis
const LANGUAGES = [
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

// UI translations
const UI_TRANSLATIONS: Record<string, Record<string, string>> = {
  'en-US': {
    helpWith: "I can help you with:",
    diagnose: "Diagnosing plant diseases (upload a photo)",
    weather: "Weather-based farming advice",
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
  },
  'hi-IN': {
    helpWith: "मैं आपकी मदद कर सकता हूं:",
    diagnose: "पौधों की बीमारियों का निदान (फोटो अपलोड करें)",
    weather: "मौसम आधारित खेती की सलाह",
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
  },
  'es-ES': {
    helpWith: "Puedo ayudarte con:",
    diagnose: "Diagnóstico de enfermedades de plantas (sube una foto)",
    weather: "Consejos agrícolas basados en el clima",
    pest: "Planes de manejo de plagas",
    voice: "Comandos de voz (¡haz clic en el micrófono!)",
    tips: "Consejos generales de agricultura",
    askMe: "¿Cómo puedo ayudarte hoy?",
    listening: "Escuchando... habla ahora",
    placeholder: "Pregunta sobre enfermedades, clima, agricultura...",
    weatherRisk: "Riesgo Clima",
    scanPlant: "Escanear Planta",
    diseaseGuide: "Guía Enfermedades",
    voiceCommand: "Comando Voz",
    speakQuestion: "Escuchando... haz tu pregunta",
    analyzing: "Analizando...",
    connectionError: "Tengo problemas para conectar con el servidor.",
  },
};

const ChatInterface: React.FC = () => {
  // Language state
  const [language, setLanguage] = useState('en-US');
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  
  const getTranslation = (key: string): string => {
    const langCode = language.startsWith('en') ? 'en-US' : 
                     language.startsWith('hi') ? 'hi-IN' : 
                     language.startsWith('es') ? 'es-ES' : 'en-US';
    return UI_TRANSLATIONS[langCode]?.[key] || UI_TRANSLATIONS['en-US'][key] || key;
  };

  const getCurrentLanguage = () => LANGUAGES.find(l => l.code === language) || LANGUAGES[0];

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: `${getCurrentLanguage().greeting}\n\n${getTranslation('helpWith')}\n- 🔬 ${getTranslation('diagnose')}\n- 🌡️ ${getTranslation('weather')}\n- 📋 ${getTranslation('pest')}\n- 🎤 ${getTranslation('voice')}\n- 💡 ${getTranslation('tips')}\n\n${getTranslation('askMe')}`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  
  // Voice interface state
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [speechSupported, setSpeechSupported] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  // Initialize speech recognition with language support
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognitionAPI) {
        setSpeechSupported(true);
        const recognition = new SpeechRecognitionAPI();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = language; // Use selected language
        
        recognition.onresult = (event: SpeechRecognitionEvent) => {
          const last = event.results.length - 1;
          const transcript = event.results[last][0].transcript;
          setInput(transcript);
          
          if (event.results[last].isFinal) {
            setIsListening(false);
          }
        };
        
        recognition.onerror = () => {
          setIsListening(false);
        };
        
        recognition.onend = () => {
          setIsListening(false);
        };
        
        recognitionRef.current = recognition;
      }
      
      synthRef.current = window.speechSynthesis;
    }
  }, [language]); // Re-initialize when language changes

  // Text-to-speech function with language support
  const speakText = useCallback((text: string) => {
    if (!synthRef.current || !voiceEnabled) return;
    
    // Cancel any ongoing speech
    synthRef.current.cancel();
    
    // Clean up the text for speech
    const cleanText = text
      .replace(/[🌱🔬🌡️📋💡🎤⚠️✅❌🌿🧪🇺🇸🇮🇳🇪🇸🇫🇷🇧🇷🇩🇪🇨🇳🇸🇦]/g, '')
      .replace(/\*\*/g, '')
      .replace(/\n+/g, '. ')
      .substring(0, 500);
    
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = language; // Use selected language
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    
    // Try to find a voice for the selected language
    const voices = synthRef.current.getVoices();
    const langVoice = voices.find(v => v.lang.startsWith(language.split('-')[0]));
    if (langVoice) {
      utterance.voice = langVoice;
    }
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    synthRef.current.speak(utterance);
  }, [voiceEnabled, language]);

  // Handle language change
  const handleLanguageChange = (langCode: string) => {
    setLanguage(langCode);
    setShowLanguageMenu(false);
    
    // Update speech recognition language
    if (recognitionRef.current) {
      recognitionRef.current.lang = langCode;
    }
    
    // Add greeting in new language
    const newLang = LANGUAGES.find(l => l.code === langCode);
    if (newLang) {
      const langTranslations = UI_TRANSLATIONS[langCode] || UI_TRANSLATIONS['en-US'];
      const greetingMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `${newLang.greeting}\n\n${langTranslations.helpWith || getTranslation('helpWith')}\n- 🔬 ${langTranslations.diagnose || getTranslation('diagnose')}\n- 🌡️ ${langTranslations.weather || getTranslation('weather')}\n- 📋 ${langTranslations.pest || getTranslation('pest')}\n- 🎤 ${langTranslations.voice || getTranslation('voice')}\n- 💡 ${langTranslations.tips || getTranslation('tips')}\n\n${langTranslations.askMe || getTranslation('askMe')}`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, greetingMessage]);
      
      if (voiceEnabled) {
        speakText(newLang.greeting);
      }
    }
  };

  // Toggle voice listening
  const toggleListening = useCallback(() => {
    if (!recognitionRef.current) return;
    
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setInput('');
      recognitionRef.current.lang = language; // Ensure correct language
      recognitionRef.current.start();
      setIsListening(true);
    }
  }, [isListening, language]);

  // Stop speaking
  const stopSpeaking = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => console.log('Location not available:', error)
      );
    }
  }, []);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSend = async () => {
    if (!input.trim() && !selectedImage) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input || 'Please analyze this image',
      image: imagePreview || undefined,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      let response: ChatResponse;

      if (selectedImage) {
        response = await apiService.sendMessageWithImage(
          input || 'What can you tell me about this plant?',
          selectedImage,
          sessionId || undefined,
          location || undefined,
          undefined,
          language // Pass language
        );
        removeImage();
      } else {
        response = await apiService.sendMessage(
          input,
          sessionId || undefined,
          undefined,
          location || undefined,
          undefined,
          language // Pass language
        );
      }

      if (!sessionId && response.session_id) {
        setSessionId(response.session_id);
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.message,
        analysis: response.analysis,
        suggestions: response.suggestions,
        actions: response.actions_available,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      
      // Speak the response if voice is enabled
      if (voiceEnabled && response.message) {
        speakText(response.message);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: getTranslation('connectionError'),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };

  const handleActionClick = async (action: string) => {
    if (action === 'get_ipm_strategy') {
      setInput('Generate an IPM strategy for me');
      handleSend();
    } else if (action === 'check_weather') {
      setInput('What are the current weather conditions and disease risks?');
      handleSend();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Language Selector Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Leaf className="w-5 h-5 text-primary-600" />
          <span className="font-semibold text-gray-800">AgriGuard</span>
        </div>
        
        {/* Language Selector */}
        <div className="relative">
          <button
            onClick={() => setShowLanguageMenu(!showLanguageMenu)}
            className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors text-sm"
            title="Change language"
          >
            <Globe className="w-4 h-4 text-gray-600" />
            <span>{getCurrentLanguage().flag}</span>
            <span className="hidden sm:inline">{getCurrentLanguage().name}</span>
          </button>
          
          {showLanguageMenu && (
            <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 max-h-80 overflow-y-auto w-48">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  className={`w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2 text-sm ${
                    language === lang.code ? 'bg-primary-50 text-primary-700' : ''
                  }`}
                >
                  <span>{lang.flag}</span>
                  <span>{lang.name}</span>
                  {language === lang.code && (
                    <span className="ml-auto text-primary-600">✓</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`chat-message flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                message.role === 'user'
                  ? 'bg-primary-600 text-white rounded-br-md'
                  : 'bg-white border border-gray-200 rounded-bl-md shadow-sm'
              }`}
            >
              {/* User image */}
              {message.image && (
                <img
                  src={message.image}
                  alt="Uploaded"
                  className="max-w-full h-auto rounded-lg mb-2 max-h-48"
                />
              )}
              
              {/* Message content */}
              <p className="whitespace-pre-wrap">{message.content}</p>

              {/* Analysis results */}
              {message.analysis && !message.analysis.parse_error && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg border">
                  <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                    <Bug className="w-4 h-4 text-red-500" />
                    Detection Results
                  </h4>
                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="font-medium">Disease:</span>{' '}
                      {message.analysis.disease_name}
                    </p>
                    {message.analysis.confidence && (
                      <p>
                        <span className="font-medium">Confidence:</span>{' '}
                        {Math.round(message.analysis.confidence * 100)}%
                      </p>
                    )}
                    <p>
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                        message.analysis.urgency_level === 'critical' ? 'bg-red-100 text-red-800' :
                        message.analysis.urgency_level === 'high' ? 'bg-orange-100 text-orange-800' :
                        message.analysis.urgency_level === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {message.analysis.urgency_level?.toUpperCase()} URGENCY
                      </span>
                    </p>
                  </div>
                </div>
              )}

              {/* Suggestions */}
              {message.suggestions && message.suggestions.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {message.suggestions.map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="text-xs px-3 py-1.5 bg-primary-50 text-primary-700 rounded-full hover:bg-primary-100 transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}

              {/* Actions */}
              {message.actions && message.actions.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {message.actions.map((action, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleActionClick(action.action)}
                      className="text-xs px-3 py-1.5 bg-primary-600 text-white rounded-full hover:bg-primary-700 transition-colors"
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
              <div className="flex items-center gap-1">
                <div className="loading-dot w-2 h-2 bg-primary-500 rounded-full"></div>
                <div className="loading-dot w-2 h-2 bg-primary-500 rounded-full"></div>
                <div className="loading-dot w-2 h-2 bg-primary-500 rounded-full"></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Image preview */}
      {imagePreview && (
        <div className="px-4 pb-2">
          <div className="relative inline-block">
            <img
              src={imagePreview}
              alt="Preview"
              className="h-20 w-auto rounded-lg border border-gray-200"
            />
            <button
              onClick={removeImage}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* Input area */}
      <div className="p-4 bg-white border-t border-gray-200">
        <div className="flex items-end gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageSelect}
            accept="image/*"
            className="hidden"
          />
          
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-3 text-gray-500 hover:text-primary-600 hover:bg-gray-100 rounded-full transition-colors"
            title="Upload image"
          >
            <ImageIcon className="w-5 h-5" />
          </button>

          {/* Voice input button */}
          {speechSupported && (
            <button
              onClick={toggleListening}
              className={`p-3 rounded-full transition-colors ${
                isListening 
                  ? 'bg-red-500 text-white animate-pulse hover:bg-red-600' 
                  : 'text-gray-500 hover:text-primary-600 hover:bg-gray-100'
              }`}
              title={isListening ? "Stop listening" : "Voice input"}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
          )}

          <div className="flex-1 relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={isListening ? "Listening... speak now" : "Ask about plant diseases, weather, farming tips..."}
              className={`w-full px-4 py-3 pr-12 border rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                isListening ? 'border-red-300 bg-red-50' : 'border-gray-200'
              }`}
              rows={1}
            />
          </div>

          {/* Voice output toggle */}
          <button
            onClick={() => {
              if (isSpeaking) {
                stopSpeaking();
              } else {
                setVoiceEnabled(!voiceEnabled);
              }
            }}
            className={`p-3 rounded-full transition-colors ${
              isSpeaking 
                ? 'bg-primary-500 text-white animate-pulse' 
                : voiceEnabled 
                  ? 'text-primary-600 hover:bg-gray-100' 
                  : 'text-gray-400 hover:bg-gray-100'
            }`}
            title={isSpeaking ? "Stop speaking" : voiceEnabled ? "Voice enabled" : "Voice disabled"}
          >
            {voiceEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>

          <button
            onClick={handleSend}
            disabled={isLoading || (!input.trim() && !selectedImage)}
            className="p-3 bg-primary-600 text-white rounded-full hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>

        {/* Voice status indicator */}
        {isListening && (
          <div className="mt-2 flex items-center justify-center gap-2 text-red-600 text-sm">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span>Listening... speak your question</span>
          </div>
        )}

        {/* Quick actions */}
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            onClick={() => setInput("What's the disease risk for my area today?")}
            className="text-xs px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors flex items-center gap-1"
          >
            <Sun className="w-3 h-3" /> Weather Risk
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-xs px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors flex items-center gap-1"
          >
            <Upload className="w-3 h-3" /> Scan Plant
          </button>
          <button
            onClick={() => setInput("What are common tomato diseases and how to prevent them?")}
            className="text-xs px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors flex items-center gap-1"
          >
            <Leaf className="w-3 h-3" /> Disease Guide
          </button>
          {speechSupported && (
            <button
              onClick={toggleListening}
              className="text-xs px-3 py-1.5 bg-primary-100 text-primary-700 rounded-full hover:bg-primary-200 transition-colors flex items-center gap-1"
            >
              <Mic className="w-3 h-3" /> Voice Command
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
