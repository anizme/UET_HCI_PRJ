import { useState, useRef, useEffect } from 'react'
import { speak } from '../services/speechSynthesis'
import { performOCR } from '../services/api'
import OCRResult from './OCRResult'
import './OCRCameraDetection.css'

export default function OCRCameraDetection() {
  const [image, setImage] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [stream, setStream] = useState(null)
  const [cameraError, setCameraError] = useState(null)
  const [text, setText] = useState('')
  const [language, setLanguage] = useState('')

  const videoRef = useRef(null)
  const canvasRef = useRef(null)

  useEffect(() => {
    return () => {
      // Cleanup: ensure camera is stopped when component unmounts
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [stream])

  const startCamera = async () => {
    try {
      setCameraError(null)
      // Kiểm tra xem thiết bị có hỗ trợ camera không
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Browser không hỗ trợ truy cập camera')
      }

      // Cấu hình camera cho thiết bị di động
      const constraints = {
        video: {
          facingMode: { exact: 'environment' }, // Bắt buộc sử dụng camera sau
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      }

      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia(constraints) 
        
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream
          videoRef.current.setAttribute('playsinline', true) // Required for iOS
          videoRef.current.setAttribute('autoplay', true)
          videoRef.current.setAttribute('muted', true)
          videoRef.current.setAttribute('controls', false)
          await videoRef.current.play()
          setStream(mediaStream)
          speak('Camera đã bật. Hãy hướng camera vào văn bản cần nhận diện.')
        }
      } catch (err) {
        // Nếu không thể sử dụng camera sau, thử dùng camera trước
        if (err.name === 'OverconstrainedError' || err.name === 'ConstraintNotSatisfiedError') {
          const frontCameraConstraints = {
            video: {
              facingMode: 'user',
              width: { ideal: 1280 },
              height: { ideal: 720 }
            }
          }
          const mediaStream = await navigator.mediaDevices.getUserMedia(frontCameraConstraints)
          
          if (videoRef.current) {
            videoRef.current.srcObject = mediaStream
            videoRef.current.setAttribute('playsinline', true)
            videoRef.current.setAttribute('autoplay', true)
            videoRef.current.setAttribute('muted', true)
            videoRef.current.setAttribute('controls', false)
            await videoRef.current.play()
            setStream(mediaStream)
            speak('Camera đã bật. Hãy hướng camera vào văn bản cần nhận diện.')
          }
        } else {
          throw err
        }
      }
    } catch (err) {
      console.error('Camera error:', err)
      let errorMessage = 'Không thể truy cập camera.'
      
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMessage += ' Vui lòng cấp quyền truy cập camera cho ứng dụng. Trên Android, hãy vào Cài đặt > Quyền riêng tư > Camera để cấp quyền cho trình duyệt.'
      } else if (err.name === 'NotFoundError') {
        errorMessage += ' Không tìm thấy thiết bị camera.'
      } else if (err.name === 'NotReadableError') {
        errorMessage += ' Camera đang được sử dụng bởi ứng dụng khác.'
      } else if (err.name === 'OverconstrainedError' || err.name === 'ConstraintNotSatisfiedError') {
        errorMessage += ' Thiết bị không hỗ trợ camera sau. Vui lòng thử lại với camera trước.'
      } else if (err.message === 'Browser không hỗ trợ truy cập camera') {
        errorMessage = err.message + '. Vui lòng sử dụng trình duyệt khác như Chrome hoặc cập nhật phiên bản trình duyệt mới nhất.'
      }
      
      setCameraError(errorMessage)
      speak(errorMessage)
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      if (videoRef.current) {
        videoRef.current.srcObject = null
      }
      setStream(null)
      setImage(null)
      setCameraError(null)
      speak('Đã tắt camera.')
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
      
      const imageData = canvas.toDataURL('image/jpeg', 0.8) // Reduced quality for better performance
      setImage(imageData)
      speak('Đã chụp ảnh. Bạn có thể nhấn nút nhận diện văn bản.')
      
      // Reset previous results when capturing a new image
      setText('')
      setLanguage('')
    }
  }

  const processImage = async () => {
    if (!image) {
      speak('Vui lòng chụp ảnh trước khi nhận diện.')
      return
    }

    setIsProcessing(true)
    speak('Đang nhận diện văn bản...')

    try {
      const result = await performOCR(image)
      console.log(result)
      setText(result.description)
      setLanguage(result.language)
      speak(`Kết quả nhận diện văn bản. Ngôn ngữ nhận diện là ${result.language}.`)
    } catch (error) {
      const errorMessage = 'Có lỗi xảy ra khi nhận diện văn bản.'
      speak(errorMessage)
      setText(errorMessage)
      console.error('OCR error:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const copyToClipboard = (content) => {
    navigator.clipboard.writeText(content)
      .then(() => {
        speak('Đã sao chép văn bản vào bộ nhớ tạm.')
      })
      .catch(err => {
        console.error('Không thể sao chép: ', err)
        speak('Không thể sao chép văn bản.')
      })
  }

  return (
    <div className="ocr-camera-recognition">
      <div className="camera-controls">
        {!stream ? (
          <button 
            onClick={startCamera}
            className="camera-button"
            aria-label="Bật camera"
          >
            Bật camera
          </button>
        ) : (
          <>
            <button 
              onClick={captureImage}
              className="camera-button"
              aria-label="Chụp ảnh"
            >
              Chụp ảnh
            </button>
            <button 
              onClick={stopCamera}
              className="camera-button"
              aria-label="Tắt camera"
            >
              Tắt camera
            </button>
          </>
        )}
      </div>

      {cameraError && (
        <div className="error-message" role="alert">
          {cameraError}
        </div>
      )}

      <div className="camera-preview">
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted
          style={{ width: '100%', maxWidth: '640px' }} 
          aria-label="Camera preview"
        />
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>

      {image && (
        <div className="captured-preview">
          <img 
            src={image} 
            alt="Ảnh đã chụp" 
            style={{ maxWidth: '300px' }} 
          />
          <button 
            onClick={processImage} 
            disabled={isProcessing}
            className="process-button"
            aria-label="Nhận diện văn bản"
          >
            {isProcessing ? 'Đang xử lý...' : 'Nhận diện văn bản'}
          </button>
        </div>
      )}

      {text && (
        <OCRResult 
          text={text}
          language={language}
          onCopy={(content) => copyToClipboard(content)}
          isProcessing={isProcessing}
        />
      )}
    </div>
  )
}