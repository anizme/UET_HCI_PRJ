import { useState, useRef, useEffect } from 'react'
import { speak } from '../services/speechSynthesis'
import { performOCR } from '../services/api'

export default function OCR() {
  const [image, setImage] = useState(null)
  const [text, setText] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const fileInputRef = useRef(null)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [stream, setStream] = useState(null)

  useEffect(() => {
    speak('Trang nhận diện văn bản. Bạn có thể tải lên hình ảnh hoặc chụp ảnh trực tiếp.')
  }, [])

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setImage(event.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true })
      videoRef.current.srcObject = mediaStream
      setStream(mediaStream)
      speak('Camera đã bật. Hãy hướng camera vào văn bản cần nhận diện.')
    } catch (err) {
      speak('Không thể truy cập camera. Vui lòng kiểm tra quyền truy cập.')
      console.error('Camera error:', err)
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
  }

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext('2d')
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      
      const imageData = canvas.toDataURL('image/jpeg')
      setImage(imageData)
      speak('Đã chụp ảnh. Bạn có thể nhấn nút nhận diện văn bản.')
    }
  }

  const processOCR = async () => {
    if (!image) {
      speak('Vui lòng tải lên hình ảnh hoặc chụp ảnh trước khi nhận diện.')
      return
    }

    setIsProcessing(true)
    speak('Đang xử lý hình ảnh...')

    try {
      const result = await performOCR(image)
      setText(result.text)
      speak(`Kết quả nhận diện: ${result.text}`)
    } catch (error) {
      speak('Có lỗi xảy ra khi nhận diện văn bản.')
      console.error('OCR error:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const readText = () => {
    if (text) {
      speak(text)
    } else {
      speak('Không có văn bản để đọc.')
    }
  }

  return (
    <div className="ocr-page">
      <h2>Nhận diện văn bản</h2>
      
      <div className="ocr-options">
        <div className="upload-section">
          <button onClick={() => fileInputRef.current.click()}>
            Tải lên hình ảnh
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            style={{ display: 'none' }}
          />
        </div>

        <div className="camera-section">
          {!stream ? (
            <button onClick={startCamera}>Bật camera</button>
          ) : (
            <>
              <button onClick={captureImage}>Chụp ảnh</button>
              <button onClick={stopCamera}>Tắt camera</button>
            </>
          )}
        </div>
      </div>

      <div className="preview-area">
        {stream && (
          <div className="camera-preview">
            <video ref={videoRef} autoPlay playsInline muted />
            <canvas ref={canvasRef} style={{ display: 'none' }} />
          </div>
        )}

        {image && !stream && (
          <div className="image-preview">
            <img src={image} alt="Preview" />
          </div>
        )}
      </div>

      <button 
        onClick={processOCR} 
        disabled={isProcessing || !image}
        className="process-button"
      >
        {isProcessing ? 'Đang xử lý...' : 'Nhận diện văn bản'}
      </button>

      {text && (
        <div className="result-section">
          <h3>Kết quả:</h3>
          <div className="text-result">{text}</div>
          <button onClick={readText}>Đọc kết quả</button>
        </div>
      )}
    </div>
  )
}