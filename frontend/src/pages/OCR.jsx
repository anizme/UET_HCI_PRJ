import { useState, useEffect } from 'react'
import { speak } from '../services/speechSynthesis'
import OCRImageUploader from '../components/OCRImageUploader'
import OCRCameraDetection from '../components/OCRCameraDetection'
import './GeneralRecognition.css'


export default function OCR() {
  const [activeTab, setActiveTab] = useState('camera')

  useEffect(() => {
    speak('Trang nhận diện văn bản. Bạn có thể tải lên hình ảnh hoặc chụp ảnh trực tiếp.')
  }, [])

  return (
    <div className="recognition-page">
      <h2>Nhận diện văn bản</h2>

      <div className="recognition-tabs">
        <button
          className={activeTab === 'upload' ? 'active-tab' : ''}
          onClick={() => setActiveTab('upload')}
        >
          Tải lên hình ảnh
        </button>
        <button
          className={activeTab === 'camera' ? 'active-tab' : ''}
          onClick={() => setActiveTab('camera')}
        >
          Sử dụng camera
        </button>
      </div>

      {activeTab === 'upload' ? <OCRImageUploader /> : <OCRCameraDetection />}
    </div>
  )
}