import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import MainApp from './MainApp';
import { LanguageProvider } from './context/LanguageContext';

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/app" element={<MainApp />} />
      </Routes>
    </LanguageProvider>
  );
};

export default App;
