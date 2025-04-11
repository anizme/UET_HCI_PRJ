import { useState, useRef, useEffect } from 'react'
import { speak } from '../services/speechSynthesis'
import { performObjectRecognition } from '../services/api'
import RecognitionResult from './RecognitionResult'
import './generic_styles/GeneralCameraDetection.css'

export default function CameraDetection() {
  const [image, setImage] = useState(null)
  const [recognitionResult, setRecognitionResult] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [stream, setStream] = useState(null)
  const [cameraError, setCameraError] = useState(null)
  const [realtimeMode, setRealtimeMode] = useState(false)
  const [captureInterval, setCaptureInterval] = useState(null)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)

  useEffect(() => {
    return () => {
      // Cleanup: ensure camera is stopped when component unmounts
      stopCameraStream()
      clearCaptureInterval()
    }
  }, [])

  // Separate functions to clean up camera and interval
  const stopCameraStream = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      if (videoRef.current) {
        videoRef.current.srcObject = null
      }
      setStream(null)
    }
  }

  const clearCaptureInterval = () => {
    if (captureInterval) {
      clearInterval(captureInterval)
      setCaptureInterval(null)
    }
  }

  const startCamera = async () => {
    try {
      setCameraError(null)
      
      // First, ensure any existing streams are stopped
      stopCameraStream()
      
      // Check if device supports camera
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Browser không hỗ trợ truy cập camera')
      }

      // Camera configuration for mobile devices
      const constraints = {
        video: {
          facingMode: { ideal: 'environment' }, // Changed from exact to ideal for better compatibility
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
          speak('Camera đã bật. Hãy hướng camera vào vật thể cần nhận diện.')
        }
      } catch (err) {
        // If back camera isn't available, try front camera
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
            speak('Camera đã bật. Hãy hướng camera vào vật thể cần nhận diện.')
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
    stopCameraStream()
    clearCaptureInterval()
    setImage(null)
    setCameraError(null)
    setRealtimeMode(false)
    speak('Đã tắt camera.')
  }

  const captureImage = () => {
    if (videoRef.current && canvasRef.current && videoRef.current.videoWidth > 0) {
      const video = videoRef.current
      const canvas = canvasRef.current
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext('2d')
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      
      const imageData = canvas.toDataURL('image/jpeg', 0.8)
      setImage(imageData)
      speak('Đã chụp ảnh. Bạn có thể nhấn nút nhận diện vật thể.')
    } else {
      speak('Không thể chụp ảnh. Hãy đảm bảo camera đang hoạt động.')
    }
  }

  const processImage = async (imageToProcess = null, shouldSpeak = true) => {
    const currentImage = imageToProcess || image
    
    if (!currentImage) {
      if (shouldSpeak) await speak('Vui lòng chụp ảnh trước khi nhận diện.')
      return
    }

    setIsProcessing(true)
    if (shouldSpeak) await speak('Đang nhận diện vật thể...')

    try {
      const result = await performObjectRecognition(currentImage)
      const description = result.description || `Nhận diện được: ${result.object}`
      setRecognitionResult(description)
      if (shouldSpeak) await speak(description)
    } catch (error) {
      const errorMessage = 'Có lỗi xảy ra khi nhận diện vật thể.'
      if (shouldSpeak) await speak(errorMessage)
      setRecognitionResult(errorMessage)
      console.error('Object recognition error:', error)
    } finally {
      setIsProcessing(false)
    }
  }
  
  const toggleRealtimeMode = () => {
    if (realtimeMode) {
      // Turn off realtime mode
      clearCaptureInterval()
      setRealtimeMode(false)
      speak('Đã tắt chế độ nhận diện thời gian thực.')
    } else {
      // Turn on realtime mode - don't restart the camera, just start the interval
      setRealtimeMode(true)
      speak('Đã bật chế độ nhận diện thời gian thực. Tự động nhận diện môi trường xung quanh.')
      
      // Start the interval for capturing and processing images
      let isProcessing = false;
      const interval = setInterval(async () => {
        if (isProcessing) return; // Skip if still processing previous image
        
        if (videoRef.current && canvasRef.current && videoRef.current.videoWidth > 0) {
          isProcessing = true;
          const video = videoRef.current
          const canvas = canvasRef.current
          canvas.width = video.videoWidth
          canvas.height = video.videoHeight
          const ctx = canvas.getContext('2d')
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
          
          const imageData = canvas.toDataURL('image/jpeg', 0.8) 
          setImage(imageData)
          await processImage(imageData, true) // Wait for processing and speaking to complete
          isProcessing = false;
        } else {
          console.warn('Video not ready for capture in real-time mode')
        }
      }, 5000) // Capture every 5 seconds
      
      setCaptureInterval(interval)
    }
  }

  return (
    <div className="camera-recognition">
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
            {!realtimeMode && (
              <button 
                onClick={captureImage}
                className="camera-button"
                aria-label="Chụp ảnh"
              >
                Chụp ảnh
              </button>
            )}
            <button 
              onClick={toggleRealtimeMode}
              className={`camera-button ${realtimeMode ? 'active' : ''}`}
              aria-label={realtimeMode ? 'Tắt nhận diện thời gian thực' : 'Bật nhận diện thời gian thực'}
            >
              {realtimeMode ? 'Tắt nhận diện thời gian thực' : 'Bật nhận diện thời gian thực'}
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

      {image && !realtimeMode && (
        <div className="captured-preview">
          <img 
            src={image} 
            alt="Ảnh đã chụp" 
            style={{ maxWidth: '300px' }} 
          />
          <button 
            onClick={() => processImage()}
            disabled={isProcessing}
            className="process-button"
            aria-label="Nhận diện vật thể"
          >
            {isProcessing ? 'Đang xử lý...' : 'Nhận diện vật thể'}
          </button>
        </div>
      )}
      
      {realtimeMode && (
        <div className="realtime-indicator">
          <p>Đang nhận diện thời gian thực {isProcessing && '(đang xử lý...)'}</p>
        </div>
      )}

      <RecognitionResult 
        result={recognitionResult} 
        isProcessing={isProcessing} 
      />
    </div>
  )
}