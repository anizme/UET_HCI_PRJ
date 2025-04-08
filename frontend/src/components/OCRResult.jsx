import { speak } from '../services/speechSynthesis'
import './OCRResult.css'

export default function OCRResult({ 
  text, 
  language, 
  onCopy,
  isProcessing 
}) {
  if (isProcessing) {
    return (
      <div className="ocr-result processing">
        <p>Đang xử lý hình ảnh...</p>
      </div>
    )
  }

  if (!text) {
    return null
  }

  return (
    <div className="ocr-result">
      <div className="result-header">
        <h3>Kết quả nhận diện</h3>
        <div className="language-badge">
          <span>Ngôn ngữ: {language}</span>
        </div>
      </div>

      <div className="text-result-container">
        <div className="text-result">
          {text}
        </div>
        <div className="text-actions">
          <button
            onClick={() => speak(text)}
            className="text-action-button"
          >
            <span>🔊</span> Đọc kết quả
          </button>
          <button
            onClick={() => onCopy(text)}
            className="text-action-button"
          >
            <span>📋</span> Sao chép
          </button>
        </div>
      </div>
    </div>
  )
}