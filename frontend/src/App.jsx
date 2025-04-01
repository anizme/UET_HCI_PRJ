import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import OCR from './pages/OCR'
import ObjectRecognition from './pages/ObjectRecognition'
import News from './pages/News'
import Header from './components/Header'
import Navigation from './components/Navigation'
import VoiceControl from './components/VoiceControl'
import AccessibilityTools from './components/AccessibilityTools'
import { speak } from './services/speechSynthesis'

export default function App() {
  const [activePage, setActivePage] = useState('home')
  const [isListening, setIsListening] = useState(false)

  useEffect(() => {
    // Initial announcement when app loads
    speak('Trang web hỗ trợ người khiếm thị đã sẵn sàng. Bạn có thể sử dụng giọng nói để điều hướng.')
  }, [])

  const handleNavigation = (page) => {
    setActivePage(page)
    speak(`Đã chuyển đến trang ${getPageName(page)}`)
  }

  const getPageName = (page) => {
    switch (page) {
      case 'home': return 'Trang chủ'
      case 'ocr': return 'Nhận diện văn bản'
      case 'object': return 'Nhận diện vật thể'
      case 'news': return 'Tin tức'
      default: return ''
    }
  }

  return (
    <Router>
      <div className="app" aria-live="polite">
        {/* <Header /> */}
        <Navigation activePage={activePage} onNavigate={handleNavigation} />
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
    </Router>
  )
}