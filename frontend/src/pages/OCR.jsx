import { useState, useRef, useEffect } from 'react'
import { speak } from '../services/speechSynthesis'
import { performOCR } from '../services/api'

export default function OCR() {
  const [image, setImage] = useState(null)
  const [text, setText] = useState('')
  const [language, setLanguage] = useState('')
  const [tempLanguage, setTempLanguage] = useState(null)
  const [tempText, setTempText] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [isUsingTemp, setIsUsingTemp] = useState(false)
  const fileInputRef = useRef(null)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [stream, setStream] = useState(null)
  const resultSectionRef = useRef(null);

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
      console.log(result)
      setText(result.text)
      setLanguage(result.language)  // Lưu ngôn ngữ phát hiện
      setTempLanguage(result.tempLanguage)
      setTempText(result.tempText)
      speak(`Kết quả nhận diện: ${result.text}. Ngôn ngữ nhận diện là ${result.language}.`)
      speak(`Đây cũng có thể là ngôn ngữ ${result.tempLanguage}. Bạn có muốn chuyển sang không?`)
      setTimeout(() => {
        scrollToResults();
      }, 300);
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

  const scrollToResults = () => {
    if (resultSectionRef.current) {
      resultSectionRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  const switchToTempLanguage = () => {
    setIsUsingTemp(true)
    speak(`Đã chuyển sang ngôn ngữ ${tempLanguage}. Nội dung là: ${tempText}`)
  }

  const switchBackToOriginalLanguage = () => {
    setIsUsingTemp(false)
    speak(`Đã quay lại ngôn ngữ ${language}. Nội dung là: ${text}`)
  }

  return (
    <div className="ocr-page">
      <h2>Nhận diện văn bản</h2>

      <div className="ocr-options">
        <div className="upload-section">
          <button onClick={() => fileInputRef.current.click()}>
            <span>📁</span> Tải lên hình ảnh
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
            <button onClick={startCamera}>
              <span>📷</span> Bật camera
            </button>
          ) : (
            <>
              <button onClick={captureImage}>
                <span>📸</span> Chụp ảnh
              </button>
              <button onClick={stopCamera}>
                <span>⏹️</span> Tắt camera
              </button>
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

        {!image && !stream && (
          <div className="empty-preview">
            <p>Tải lên hình ảnh hoặc chụp ảnh để bắt đầu</p>
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
        <div className="result-section" ref={resultSectionRef}>
          <div className="result-header">
            <h3>Kết quả nhận diện</h3>
            <div className="language-badge">
              <span>Ngôn ngữ: {isUsingTemp ? tempLanguage : language}</span>
              {tempLanguage && (
                <div className="switch-language">
                  {!isUsingTemp ? (
                    <>
                      <p>Đây cũng có thể là ngôn ngữ <strong>{tempLanguage}</strong>. Bạn có muốn chuyển sang không?</p>
                      <button onClick={switchToTempLanguage} className="language-switch-button">
                        Chuyển sang {tempLanguage}
                      </button>
                    </>
                  ) : (
                    <button onClick={switchBackToOriginalLanguage} className="language-switch-button">
                      Quay lại {language}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="text-result-container">
            <div className="text-result">
              {isUsingTemp ? tempText : text}
            </div>
            <div className="text-actions">
              <button
                onClick={() => speak(isUsingTemp ? tempText : text)}
                className="text-action-button"
              >
                <span>🔊</span> Đọc kết quả
              </button>
              <button
                onClick={() => copyToClipboard(isUsingTemp ? tempText : text)}
                className="text-action-button"
              >
                <span>📋</span> Sao chép
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}