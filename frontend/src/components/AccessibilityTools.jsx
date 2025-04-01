import { useState, useEffect } from 'react';
import { speak } from '../services/speechSynthesis';

export default function AccessibilityTools() {
  const [fontSize, setFontSize] = useState(16);
  const [highContrast, setHighContrast] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Apply initial accessibility settings
    document.documentElement.style.fontSize = `${fontSize}px`;
    document.body.className = highContrast ? 'high-contrast' : '';
    document.body.classList.toggle('dark-mode', darkMode);
  }, [fontSize, highContrast, darkMode]);

  const increaseFontSize = () => {
    const newSize = Math.min(fontSize + 2, 24);
    setFontSize(newSize);
    speak(`Cỡ chữ tăng lên ${newSize} pixel`);
  };

  const decreaseFontSize = () => {
    const newSize = Math.max(fontSize - 2, 12);
    setFontSize(newSize);
    speak(`Cỡ chữ giảm xuống ${newSize} pixel`);
  };

  const toggleHighContrast = () => {
    setHighContrast(!highContrast);
    speak(`Chế độ tương phản cao ${!highContrast ? 'bật' : 'tắt'}`);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    speak(`Chế độ tối ${!darkMode ? 'bật' : 'tắt'}`);
  };

  return (
    <div className="accessibility-tools">
      <h3 className="sr-only">Công cụ hỗ trợ tiếp cận</h3>
      <div className="tool-buttons">
        <button onClick={increaseFontSize} aria-label="Tăng cỡ chữ">
          A+
        </button>
        <button onClick={decreaseFontSize} aria-label="Giảm cỡ chữ">
          A-
        </button>
        <button 
          onClick={toggleHighContrast} 
          aria-label={`Chế độ tương phản cao ${highContrast ? 'đang bật' : 'đang tắt'}`}
        >
          🎨
        </button>
        <button 
          onClick={toggleDarkMode} 
          aria-label={`Chế độ tối ${darkMode ? 'đang bật' : 'đang tắt'}`}
        >
          {darkMode ? '☀️' : '🌙'}
        </button>
      </div>
    </div>
  );
}