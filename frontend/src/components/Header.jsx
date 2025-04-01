import { useEffect } from 'react'
import { speak } from '../services/speechSynthesis'

export default function Header() {
  const handleFocus = () => {
    speak('Tiêu đề trang, hỗ trợ người khiếm thị')
  }

  return (
    <header className="app-header" tabIndex="0" onFocus={handleFocus}>
      <h1>Hỗ trợ người khiếm thị</h1>
    </header>
  )
}