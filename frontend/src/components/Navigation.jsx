import { useEffect } from 'react'
import { speak } from '../services/speechSynthesis'

export default function Navigation({ activePage, onNavigate }) {
  const navItems = [
    { id: 'home', label: 'Trang chủ' },
    { id: 'ocr', label: 'Nhận diện văn bản' },
    { id: 'object', label: 'Nhận diện vật thể' },
    { id: 'news', label: 'Tin tức' }
  ]

  const handleItemClick = (itemId) => {
    onNavigate(itemId)
  }

  const handleItemFocus = (label) => {
    speak(label)
  }

  return (
    <nav className="main-navigation" aria-label="Main navigation">
      <div className="site-title" tabIndex="0" onFocus={() => speak('Xai ly - Trang web hỗ trợ người khiếm thị')}>
        SIGHTLY
      </div>
      <ul>
        {navItems.map(item => (
          <li key={item.id}>
            <button
              className={activePage === item.id ? 'active' : ''}
              onClick={() => handleItemClick(item.id)}
              onFocus={() => handleItemFocus(item.label)}
              aria-current={activePage === item.id ? 'page' : null}
            >
              {item.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}