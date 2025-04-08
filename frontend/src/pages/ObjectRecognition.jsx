import { useState, useEffect } from 'react'
import { speak } from '../services/speechSynthesis'
import ImageUploader from '../components/ImageUploader'
import CameraDetection from '../components/CameraDetection'
import './ObjectRecognition.css'

export default function ObjectRecognition() {
  const [activeTab, setActiveTab] = useState('upload')

  return (
    <div className="object-recognition-page">
      <h2>Nhận diện vật thể</h2>
      
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

      {activeTab === 'upload' ? <ImageUploader /> : <CameraDetection />}
    </div>
  )
}
