import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Mic, 
  MicOff,
  Volume2,
  Clock,
  Sparkles,
  CheckCircle,
  TrendingUp,
  MessageCircle,
  Loader2
} from 'lucide-react';
import apiService from '../services/api';
import { useLanguage } from '../context/LanguageContext';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const AIAgent: React.FC = () => {
  const { language, t } = useLanguage();

  const suggestedQuestions = [
    t('suggestedQ1') || "What should I do about the corn earworm in Field A?",
    t('suggestedQ2') || "How can I improve soil moisture in Field B?",
    t('suggestedQ3') || "What's the best time to harvest my corn?",
    t('suggestedQ4') || "Explain integrated pest management strategies",
    t('suggestedQ5') || "Should I irrigate today based on weather conditions?",
    t('suggestedQ6') || "What fertilizer should I use for my wheat crop?",
    t('suggestedQ7') || "How do I prevent late blight in tomatoes?",
    t('suggestedQ8') || "What are the signs of nitrogen deficiency?"
  ];

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: t('agentGreeting') || "👋 Hello! I'm your AgriGuard AI assistant. I've analyzed your farm data and I'm ready to help optimize your operations.\n\nI can assist with crop health, pest management, irrigation scheduling, and harvest planning. What would you like to discuss today?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = language;

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => setIsListening(false);
      recognitionRef.current.onend = () => setIsListening(false);
    }
  }, [language]);

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.lang = language;
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text.replace(/[*#_`]/g, ''));
      utterance.lang = language;
      
      // Force language-specific voice for multilingual support
      const voices = window.speechSynthesis.getVoices();
      const targetLang = language.split('-')[0].toLowerCase(); // e.g. 'hi'
      
      // Try exact match, then prefix match, then name match
      const voice = voices.find(v => v.lang.replace('_', '-').toLowerCase() === language.toLowerCase()) || 
                    voices.find(v => v.lang.toLowerCase().startsWith(targetLang)) ||
                    voices.find(v => v.name.toLowerCase().includes(targetLang) || v.name.toLowerCase().includes('hindi'));
                    
      if (voice) {
        utterance.voice = voice;
      }
      
      utterance.rate = 0.9;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const sendMessage = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await apiService.sendMessage(messageText, undefined, undefined, undefined, undefined, language);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.message || "I'm sorry, I couldn't process that request.",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm having trouble connecting to the server. Please make sure the backend is running.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="h-full flex bg-transparent">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col glass-card m-4 sm:m-6 overflow-hidden">
        {/* Header */}
        <div className="bg-white/40 border-b border-white/60 p-4 sm:p-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Bot className="w-7 h-7 text-primary-600" />
            AgriGuard AI Agent
          </h1>
          <p className="text-gray-500 mt-1">Your intelligent farming assistant powered by advanced AI</p>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mt-6">
            <div className="bg-white/50 rounded-xl p-4 border border-white/60">
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <Sparkles className="w-4 h-4 text-purple-500" />
                <span className="text-sm">Conversations</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">127</p>
              <p className="text-xs text-gray-500">This month</p>
            </div>
            <div className="bg-white/50 rounded-xl p-4 border border-white/60">
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <Clock className="w-4 h-4 text-blue-500" />
                <span className="text-sm">Response Time</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">1.2s</p>
              <p className="text-xs text-gray-500">Average</p>
            </div>
            <div className="bg-white/50 rounded-xl p-4 border border-white/60">
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm">Recommendations</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">43</p>
              <p className="text-xs text-gray-500">Implemented</p>
            </div>
            <div className="bg-white/50 rounded-xl p-4 border border-white/60">
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-sm">Accuracy</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">94.2%</p>
              <p className="text-xs text-gray-500">Prediction rate</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-3xl mx-auto space-y-4">
            {/* Chat Header */}
            <div className="flex items-center gap-2 mb-4">
              <MessageCircle className="w-5 h-5 text-gray-600" />
              <span className="font-medium text-gray-700">Chat with AgriGuard AI</span>
              <span className="text-gray-400 text-sm">Ask questions about your crops, pests, weather, and more</span>
            </div>

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl p-4 ${
                    message.role === 'user'
                      ? 'bg-primary-600 text-white shadow-md'
                      : 'bg-white/80 border border-white/60 shadow-sm'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center">
                        <Bot className="w-4 h-4 text-primary-600" />
                      </div>
                      <span className="text-xs text-gray-500">AgriGuard AI</span>
                    </div>
                  )}
                  <p className={`text-sm whitespace-pre-wrap ${message.role === 'user' ? 'text-white' : 'text-gray-700'}`}>
                    {message.content}
                  </p>
                  <div className={`flex items-center justify-between mt-2 ${message.role === 'user' ? 'text-primary-200' : 'text-gray-400'}`}>
                    <span className="text-xs">{formatTime(message.timestamp)}</span>
                    {message.role === 'assistant' && (
                      <button
                        onClick={() => speakText(message.content)}
                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                        title="Listen"
                      >
                        <Volume2 className={`w-4 h-4 ${isSpeaking ? 'text-primary-600' : 'text-gray-400'}`} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white/80 border border-white/60 shadow-sm rounded-2xl p-4 max-w-[80%]">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 text-primary-600 animate-spin" />
                    <span className="text-sm text-gray-600">Thinking...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input */}
        <div className="bg-white/40 border-t border-white/60 p-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-3">
              <button
                onClick={toggleListening}
                className={`p-3 rounded-xl transition-colors ${
                  isListening 
                    ? 'bg-red-100 text-red-600' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title={isListening ? 'Stop listening' : 'Voice input'}
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
              
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={isListening ? "Listening..." : "Ask about your crops, pests, weather..."}
                  className="w-full px-4 py-3 bg-white/50 border border-white/60 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  disabled={isListening}
                />
              </div>

              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || isLoading}
                className="p-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Send message"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Suggested Questions Sidebar */}
      <div className="hidden lg:block w-80 glass-card my-4 sm:my-6 mr-4 sm:mr-6 p-6 overflow-y-auto">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-purple-500" />
          <h3 className="font-semibold text-gray-900">Suggested Questions</h3>
        </div>
        <p className="text-sm text-gray-500 mb-4">Quick prompts to get started</p>
        
        <div className="space-y-2">
          {suggestedQuestions.map((question, idx) => (
            <button
              key={idx}
              onClick={() => sendMessage(question)}
              className="w-full text-left p-3 bg-white/50 hover:bg-white/80 rounded-xl text-sm text-gray-700 transition-colors border border-white/60"
            >
              {question}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AIAgent;
