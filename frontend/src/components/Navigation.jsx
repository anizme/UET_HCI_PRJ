import { useEffect, useState } from 'react'
import { cancelSpeech, speak } from '../services/speechSynthesis'
import { Link, useLocation } from 'react-router-dom'
import './Navigation.css'

export default function Navigation() {
  const location = useLocation()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const navItems = [
    { id: 'home', label: 'Trang chủ', path: '/' },
    { id: 'ocr', label: 'Nhận diện văn bản', path: '/ocr' },
    { id: 'object', label: 'Nhận diện vật thể', path: '/object-recognition' },
    { id: 'news', label: 'Tin tức', path: '/news' }
  ]

  const getActivePage = () => {
    return navItems.find(item => item.path === location.pathname)?.id || 'home'
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  // Đóng menu khi chuyển trang
  useEffect(() => {
    setIsMenuOpen(false)
  }, [location])

  return (
    <nav className="main-navigation" aria-label="Main navigation">
      <div className="nav-header">
        <div className="site-title" tabIndex="0" onFocus={() => {
          cancelSpeech()
          speak('Chào mừng bạn đến với Xai ly. ' +
            'Bạn có thể sử dụng giọng nói để điều hướng giữa các trang: ' +
            'Trang chủ, Nhận diện văn bản, Nhận diện vật thể, và Tin tức.'
          )
        }}>
          <Link to="/">SIGHTLY</Link>
        </div>
        <button 
          className="menu-toggle" 
          onClick={toggleMenu}
          aria-label={isMenuOpen ? "Đóng menu" : "Mở menu"}
          aria-expanded={isMenuOpen}
        >
          <span className="hamburger"></span>
        </button>
      </div>
      
      <div className={`nav-items ${isMenuOpen ? 'open' : ''}`} aria-label="Main navigation items">
        <ul>
          {navItems.map(item => (
            <li key={item.id}>
              <Link
                to={item.path}
                className={getActivePage() === item.id ? 'active' : ''}
                aria-current={getActivePage() === item.id ? 'page' : null}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}