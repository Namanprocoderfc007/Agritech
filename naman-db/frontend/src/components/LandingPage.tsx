import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage, LANGUAGES } from '../context/LanguageContext';
import { Leaf, Shield, Cloud, Droplets, TrendingUp, ChevronDown, CheckCircle, Mail, Phone, MapPin } from 'lucide-react';

const LandingPage: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (showSplash) {
      const progressInterval = setInterval(() => {
        setProgress(p => Math.min(p + 5, 100));
      }, 100);
      
      const splashTimer = setTimeout(() => {
        setShowSplash(false);
        setTimeout(() => setIsLoaded(true), 100);
      }, 2000);
      
      return () => {
        clearInterval(progressInterval);
        clearTimeout(splashTimer);
      };
    }
  }, [showSplash]);

  if (showSplash) {
    return (
      <div className="min-h-screen bg-watermark flex flex-col items-center justify-center">
        <div className="glass-card p-12 flex flex-col items-center justify-center">
          <div className="w-24 h-24 bg-primary-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-primary-500/50 mb-8 relative overflow-hidden animate-bounce">
             <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/40 to-white/0 animate-[spin_2s_linear_infinite]" />
             <Leaf className="w-12 h-12 text-white relative z-10" />
          </div>
          <h1 className="text-5xl font-extrabold text-primary-700 tracking-tight mb-3">AgriGuard</h1>
          <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden mt-4">
            <div 
              className="h-full bg-primary-600 rounded-full transition-all duration-100 ease-out" 
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-primary-600 font-medium mt-3 text-sm">Loading your agricultural assistant...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-watermark text-gray-900 overflow-x-hidden">
      {/* Navigation */}
      <nav className="glass-card m-4 sm:mx-8 sm:mt-6 px-6 py-4 flex justify-between items-center z-50 relative">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/30">
            <Leaf className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-gray-900 tracking-tight">AgriGuard</span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative group">
            <button className="flex items-center gap-2 bg-white/50 hover:bg-white/80 px-3 py-2 rounded-lg border border-white/60 transition-colors">
              <span className="text-xl">{LANGUAGES.find(l => l.code === language)?.flag}</span>
              <span className="text-sm font-medium hidden sm:block">{LANGUAGES.find(l => l.code === language)?.name}</span>
              <ChevronDown className="w-4 h-4 text-gray-600" />
            </button>
            <div className="absolute right-0 top-full mt-2 w-48 glass-card py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={`w-full text-left px-4 py-2 hover:bg-primary-50 flex items-center gap-3 transition-colors ${language === lang.code ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-700'}`}
                >
                  <span className="text-xl">{lang.flag}</span>
                  <span>{lang.name}</span>
                </button>
              ))}
            </div>
          </div>
          
          <button 
            onClick={() => navigate('/login')}
            className="hidden sm:block px-5 py-2 text-primary-700 font-semibold hover:bg-primary-50 rounded-lg transition-colors"
          >
            Log In
          </button>
          
          <button 
            onClick={() => navigate('/signup')}
            className="px-5 py-2 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 shadow-md transition-colors"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className={`pt-24 pb-16 px-4 sm:px-8 max-w-7xl mx-auto transition-all duration-1000 transform ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        <div className="glass-card p-8 sm:p-16 text-center max-w-4xl mx-auto space-y-8">
          <h1 className="text-5xl sm:text-7xl font-extrabold text-gray-900 leading-tight">
            Smart Farming for a <br className="hidden sm:block" />
            <span className="text-primary-600">
              Sustainable Future
            </span>
          </h1>
          <p className="text-xl text-gray-700 max-w-2xl mx-auto font-medium">
            AgriGuard empowers farmers with AI-driven insights, early disease detection, and precise weather forecasting to maximize yield and minimize risks.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button 
              onClick={() => navigate('/signup')}
              className="w-full sm:w-auto px-8 py-4 bg-primary-600 text-white text-lg font-bold rounded-xl hover:bg-primary-700 shadow-xl shadow-primary-500/20 transition-all hover:scale-105"
            >
              Start Farming Smarter
            </button>
            <button 
              onClick={() => navigate('/login')}
              className="w-full sm:w-auto px-8 py-4 glass-card text-gray-800 text-lg font-bold rounded-xl hover:bg-white/90 transition-all"
            >
              Log In to Dashboard
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Powerful Features for Modern Agriculture</h2>
          <p className="text-gray-600 mt-4 max-w-2xl mx-auto">Everything you need to monitor, manage, and optimize your farm operations from a single dashboard.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { icon: Shield, title: 'AI Disease Detection', desc: 'Instantly identify plant diseases by taking a photo. Get accurate treatment recommendations.', color: 'text-red-500', bg: 'bg-red-100' },
            { icon: Cloud, title: 'Micro-climate Weather', desc: 'Hyper-local weather forecasting with optimal spray window recommendations.', color: 'text-blue-500', bg: 'bg-blue-100' },
            { icon: TrendingUp, title: 'Mandi Prices', desc: 'Real-time agricultural market prices to help you sell your produce at the best time.', color: 'text-green-500', bg: 'bg-green-100' },
            { icon: CheckCircle, title: 'IPM Strategies', desc: 'Custom Integrated Pest Management plans for sustainable and organic farming.', color: 'text-emerald-500', bg: 'bg-emerald-100' },
            { icon: Droplets, title: 'Irrigation Advisory', desc: 'Smart watering schedules based on soil type, crop stage, and weather forecasts.', color: 'text-cyan-500', bg: 'bg-cyan-100' },
            { icon: Leaf, title: 'Multilingual AI Agent', desc: 'Chat with our AI agronomist in your native language via voice or text.', color: 'text-primary-600', bg: 'bg-primary-100' }
          ].map((feature, idx) => (
            <div key={idx} className="glass-card p-8 hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1 border-t-4 border-transparent hover:border-primary-500">
              <div className={`w-14 h-14 ${feature.bg} rounded-2xl flex items-center justify-center mb-6`}>
                <feature.icon className={`w-7 h-7 ${feature.color}`} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 sm:px-8 max-w-7xl mx-auto">
        <div className="glass-card p-10 sm:p-16 rounded-3xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-primary-100 rounded-full blur-3xl opacity-50"></div>
          <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-blue-100 rounded-full blur-3xl opacity-50"></div>
          
          <div className="text-center mb-12 relative z-10">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Trusted by Farmers</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
            {[
              { text: "AgriGuard helped me save my tomato crop from late blight before it spread. The AI detection is incredibly fast and accurate.", author: "Rajesh Kumar", location: "Punjab, India" },
              { text: "I check the Mandi prices and weather every morning. It has completely changed how I plan my harvesting and sales.", author: "Suresh Patil", location: "Maharashtra, India" },
              { text: "Being able to talk to the AI Agent in my native language makes all the difference. It's like having an expert in my pocket.", author: "Ramesh Yadav", location: "Uttar Pradesh, India" }
            ].map((testimonial, idx) => (
              <div key={idx} className="glass-card p-6 relative">
                <p className="text-gray-700 italic mb-6">"{testimonial.text}"</p>
                <div>
                  <h4 className="font-bold text-gray-900">{testimonial.author}</h4>
                  <p className="text-sm text-gray-500">{testimonial.location}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer / Contact */}
      <footer className="mt-12 glass-card border-x-0 border-b-0 rounded-none pt-16 pb-8 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <Leaf className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">AgriGuard</span>
              </div>
              <p className="text-gray-600 max-w-sm mb-6">
                Bringing cutting-edge AI technology to the hands of Indian farmers, ensuring food security and sustainable agricultural practices.
              </p>
              <p className="text-sm font-semibold text-primary-700 bg-primary-50 inline-block px-3 py-1 rounded-full">
                Built by students of Narula Institute of Technology
              </p>
            </div>
            
            <div>
              <h3 className="font-bold text-gray-900 mb-4">Contact Us</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-gray-600">
                  <Mail className="w-5 h-5 text-primary-500 mt-0.5" />
                  <span>support@agriguard.in</span>
                </li>
                <li className="flex items-start gap-3 text-gray-600">
                  <Phone className="w-5 h-5 text-primary-500 mt-0.5" />
                  <span>+91 1800 123 4567</span>
                </li>
                <li className="flex items-start gap-3 text-gray-600">
                  <MapPin className="w-5 h-5 text-primary-500 mt-0.5" />
                  <span>Narula Institute of Technology,<br/>Kolkata, West Bengal</span>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold text-gray-900 mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-600 hover:text-primary-600 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-600 hover:text-primary-600 transition-colors">Terms of Use</a></li>
                <li><a href="#" className="text-gray-600 hover:text-primary-600 transition-colors">Data Security</a></li>
                <li><a href="#" className="text-gray-600 hover:text-primary-600 transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-gray-200 text-center text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} AgriGuard. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
