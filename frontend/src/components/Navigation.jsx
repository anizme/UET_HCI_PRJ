import { useEffect } from 'react'
import { speak } from '../services/speechSynthesis'
import { Link, useLocation } from 'react-router-dom'

export default function Navigation() {
  const location = useLocation()

  const navItems = [
    { id: 'home', label: 'Trang chủ', path: '/' },
    { id: 'ocr', label: 'Nhận diện văn bản', path: '/ocr' },
    { id: 'object', label: 'Nhận diện vật thể', path: '/object-recognition' },
    { id: 'news', label: 'Tin tức', path: '/news' }
  ]

  // Xác định activePage dựa trên URL hiện tại
  const getActivePage = () => {
    return navItems.find(item => item.path === location.pathname)?.id || 'home'
  }

  const handleItemFocus = (label) => {
    speak(label)
  }

  return (
    <nav className="main-navigation" aria-label="Main navigation">
      <div className="site-title" tabIndex="0" onFocus={() => speak('SIGHTLY - Trang web hỗ trợ người khiếm thị')}>
        <Link to="/">SIGHTLY</Link>
      </div>
      <ul>
        {navItems.map(item => (
          <li key={item.id}>
            <Link
              to={item.path}
              className={getActivePage() === item.id ? 'active' : ''}
              onFocus={() => handleItemFocus(item.label)}
              aria-current={getActivePage() === item.id ? 'page' : null}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}