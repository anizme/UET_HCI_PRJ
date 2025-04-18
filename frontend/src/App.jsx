import { useState, useEffect } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import OCR from './pages/OCR'
import ObjectRecognition from './pages/ObjectRecognition'
import News from './pages/News'
import Navigation from './components/Navigation'
import VoiceControl from './components/VoiceControl'
import AccessibilityTools from './components/AccessibilityTools'
import { speak, cancelSpeech, initializeSpeechSynthesis } from './services/speechSynthesis';
import './App.css'

function NavigationWrapper({ onNavigate }) {
  const location = useLocation()

  const getActivePage = () => {
    switch (location.pathname) {
      case '/ocr': return 'ocr'
      case '/object-recognition': return 'object'
      case '/news': return 'news'
      default: return 'home'
    }
  }

  return (
    <Navigation
      activePage={getActivePage()}
      onNavigate={onNavigate}
    />
  )
}

export default function App() {
  const [isListening, setIsListening] = useState(false)
  const navigate = useNavigate()

  const location = useLocation();

  useEffect(() => {
    initializeSpeechSynthesis().then(() => {
      const pathname = location.pathname;
      cancelSpeech();
      if (pathname === '/') {
        speak('Trang chủ.');
      } else if (pathname === '/ocr') {
        speak('Trang nhận diện văn bản.');
      } else if (pathname === '/object-recognition') {
        speak('Trang nhận diện vật thể.');
      } else if (pathname === '/news') {
        speak('Trang tin tức.');
      }
    });
  }, [location.pathname]);

  const handleNavigation = (page) => {
    let path = '/'
    switch (page) {
      case 'ocr': path = '/ocr'; break
      case 'object': path = '/object-recognition'; break
      case 'news': path = '/news'; break
      default: path = '/'
    }
    navigate(path)
  }

  return (
    <div className="app" aria-live="polite">
      <NavigationWrapper onNavigate={handleNavigation} />
      <VoiceControl
        isListening={isListening}
        setIsListening={setIsListening}
        onNavigate={handleNavigation}
      />
      <AccessibilityTools />

      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/ocr" element={<OCR />} />
          <Route path="/object-recognition" element={<ObjectRecognition />} />
          <Route path="/news" element={<News />} />
        </Routes>
      </main>
    </div>
  )
}