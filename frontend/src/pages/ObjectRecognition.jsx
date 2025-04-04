import { useState, useRef, useEffect } from 'react'
import { speak } from '../services/speechSynthesis'
import { performObjectRecognition } from '../services/api'
import ImageUploader from '../components/ImageUploader'
import './ObjectRecognition.css'

export default function ObjectRecognition() {
  const videoRef = useRef(null)
  const [stream, setStream] = useState(null)
  const [objects, setObjects] = useState([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [isRealTime, setIsRealTime] = useState(false)
  const intervalRef = useRef(null)
  const [activeTab, setActiveTab] = useState('upload') // Default to upload tab for testing

  useEffect(() => {
    speak('Trang nhận diện vật thể. Hãy bật camera để bắt đầu nhận diện.')
    return () => {
      stopCamera()
      stopRealTimeDetection()
    }
  }, [])

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true })
      videoRef.current.srcObject = mediaStream
      setStream(mediaStream)
      speak('Camera đã bật. Hãy hướng camera vào vật thể cần nhận diện.')
    } catch (err) {
      speak('Không thể truy cập camera. Vui lòng kiểm tra quyền truy cập.')
      console.error('Camera error:', err)
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
      stopRealTimeDetection()
    }
  }

  const captureAndDetect = async () => {
    if (!stream) {
      speak('Vui lòng bật camera trước.')
      return
    }

    setIsProcessing(true)
    speak('Đang nhận diện vật thể...')

    try {
      const canvas = document.createElement('canvas')
      canvas.width = videoRef.current.videoWidth
      canvas.height = videoRef.current.videoHeight
      const ctx = canvas.getContext('2d')
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height)
      
      const imageData = canvas.toDataURL('image/jpeg')
      const result = await performObjectRecognition(imageData)
      
      // Lưu cả đối tượng và mô tả chi tiết
      setObjects([{
        name: result.object,
        description: result.description || `Nhận diện được: ${result.object}`
      }])
      
      // Đọc mô tả chi tiết nếu có
      if (result.description) {
        speak(result.description)
      } else {
        speak(`Nhận diện được: ${result.object}`)
      }
    } catch (error) {
      speak('Có lỗi xảy ra khi nhận diện vật thể.')
      console.error('Object recognition error:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const startRealTimeDetection = () => {
    if (!stream) {
      speak('Vui lòng bật camera trước.')
      return
    }

    setIsRealTime(true)
    speak('Bắt đầu nhận diện vật thể theo thời gian thực.')

    intervalRef.current = setInterval(async () => {
      try {
        const canvas = document.createElement('canvas')
        canvas.width = videoRef.current.videoWidth
        canvas.height = videoRef.current.videoHeight
        const ctx = canvas.getContext('2d')
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height)
        
        const imageData = canvas.toDataURL('image/jpeg')
        const result = await performObjectRecognition(imageData)
        
        setObjects(prev => {
          // Tạo đối tượng mới với tên và mô tả
          const newObject = {
            name: result.object,
            description: result.description || `Nhận diện được: ${result.object}`
          }
          
          // Chỉ đọc nếu đối tượng hoặc mô tả thay đổi
          if (prev.length === 0 || 
              prev[0].name !== newObject.name || 
              prev[0].description !== newObject.description) {
            if (result.description) {
              speak(result.description)
            } else {
              speak(result.object)
            }
          }
          return [newObject]
        })
      } catch (error) {
        console.error('Real-time detection error:', error)
      }
    }, 3000) // Process every 3 seconds
  }

  const stopRealTimeDetection = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setIsRealTime(false)
    speak('Đã dừng nhận diện thời gian thực.')
  }

  const readObjects = () => {
    if (objects.length > 0) {
      // Đọc mô tả chi tiết nếu có
      const descriptions = objects.map(obj => obj.description || `Nhận diện được: ${obj.name}`)
      speak(descriptions.join('. '))
    } else {
      speak('Không có vật thể nào được nhận diện.')
    }
  }

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

      {activeTab === 'upload' ? (
        <ImageUploader />
      ) : (
        <div className="camera-recognition">
          <div className="camera-controls">
            {!stream ? (
              <button onClick={startCamera}>Bật camera</button>
            ) : (
              <button onClick={stopCamera}>Tắt camera</button>
            )}
          </div>

          <div className="camera-preview">
            {stream && <video ref={videoRef} autoPlay playsInline muted />}
          </div>

          <div className="detection-controls">
            <button 
              onClick={captureAndDetect} 
              disabled={isProcessing || !stream}
            >
              {isProcessing ? 'Đang xử lý...' : 'Nhận diện vật thể'}
            </button>

            {!isRealTime ? (
              <button onClick={startRealTimeDetection} disabled={!stream}>
                Nhận diện thời gian thực
              </button>
            ) : (
              <button onClick={stopRealTimeDetection}>
                Dừng nhận diện
              </button>
            )}
          </div>

          {objects.length > 0 && (
            <div className="result-section">
              <h3>Kết quả nhận diện:</h3>
              <ul>
                {objects.map((obj, index) => (
                  <li key={index}>
                    <strong>{obj.name}</strong>
                    <p>{obj.description}</p>
                  </li>
                ))}
              </ul>
              <button onClick={readObjects}>Đọc kết quả</button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}