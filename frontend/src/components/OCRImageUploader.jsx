import { useState, useRef } from 'react'
import { speak } from '../services/speechSynthesis'
import { performOCR } from '../services/api'
import OCRResult from './OCRResult'
import './OCRImageUploader.css'

export default function OCRImageUploader() {
  const [selectedImage, setSelectedImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [text, setText] = useState('')
  const [language, setLanguage] = useState('')

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target.result)
        setSelectedImage(e.target.result)
      }
      reader.readAsDataURL(file)
      
      // Reset previous results
      setText('')
      setLanguage('')
    }
  }

  const handleUpload = async () => {
    if (!selectedImage) {
      speak('Vui lòng chọn một hình ảnh trước.')
      return
    }

    setIsProcessing(true)
    speak('Đang nhận diện văn bản trong hình ảnh...')

    try {
      const result = await performOCR(selectedImage)
      console.log(result)
      setText(result.description)
      setLanguage(result.language)
      speak(`Kết quả nhận diện văn bản. Ngôn ngữ nhận diện là ${result.language}.`)
    } catch (error) {
      console.error('Error processing image:', error)
      speak('Có lỗi xảy ra khi xử lý hình ảnh.')
      setText('Có lỗi xảy ra khi xử lý hình ảnh.')
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
    <div className="ocr-image-uploader">
      <div className="upload-section">
        <input 
          type="file" 
          accept="image/*" 
          onChange={handleImageChange} 
          id="ocr-image-input"
          aria-label="Chọn hình ảnh để nhận diện văn bản"
        />
        <label htmlFor="ocr-image-input" className="file-input-label">
          Chọn hình ảnh
        </label>
        
        <button 
          onClick={handleUpload} 
          disabled={!selectedImage || isProcessing}
          className="upload-button"
        >
          {isProcessing ? 'Đang xử lý...' : 'Nhận diện văn bản'}
        </button>
      </div>

      <div className="preview-section">
        {imagePreview && (
          <div className="image-preview">
            <img src={imagePreview} alt="Hình ảnh đã chọn" />
          </div>
        )}
      </div>

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