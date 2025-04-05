import { useState } from 'react'
import { speak } from '../services/speechSynthesis'
import { performObjectRecognition } from '../services/api'
import RecognitionResult from './RecognitionResult'
import './ImageUploader.css'

export default function ImageUploader() {
  const [selectedImage, setSelectedImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [recognitionResult, setRecognitionResult] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setSelectedImage(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target.result)
      }
      reader.readAsDataURL(file)
      
      // Reset previous results
      setRecognitionResult('')
    }
  }

  const handleUpload = async () => {
    if (!selectedImage) {
      speak('Vui lòng chọn một hình ảnh trước.')
      return
    }

    setIsProcessing(true)
    speak('Đang nhận diện vật thể trong hình ảnh...')

    try {
      // Convert image to base64
      const reader = new FileReader()
      reader.readAsDataURL(selectedImage)
      
      reader.onload = async () => {
        try {
          const imageData = reader.result
          const result = await performObjectRecognition(imageData)
          
          // Format the result as a descriptive text
          const description = formatDescription(result)
          setRecognitionResult(description)
          speak(description)
        } catch (error) {
          console.error('Error processing image:', error)
          speak('Có lỗi xảy ra khi xử lý hình ảnh.')
          setRecognitionResult('Có lỗi xảy ra khi xử lý hình ảnh.')
        } finally {
          setIsProcessing(false)
        }
      }
    } catch (error) {
      console.error('Error reading file:', error)
      speak('Có lỗi xảy ra khi đọc tệp hình ảnh.')
      setRecognitionResult('Có lỗi xảy ra khi đọc tệp hình ảnh.')
      setIsProcessing(false)
    }
  }

  const formatDescription = (result) => {
    if (!result) {
      return 'Không nhận diện được vật thể trong hình ảnh.'
    }
    
    if (result.description) {
      return result.description
    }
    
    // Fallback cho trường hợp không có mô tả
    return 'Không thể tạo mô tả chi tiết cho hình ảnh này.'
  }

  return (
    <div className="image-uploader">
      <div className="upload-section">
        <input 
          type="file" 
          accept="image/*" 
          onChange={handleImageChange} 
          id="image-input"
          aria-label="Chọn hình ảnh để nhận diện"
        />
        <label htmlFor="image-input" className="file-input-label">
          Chọn hình ảnh
        </label>
        
        <button 
          onClick={handleUpload} 
          disabled={!selectedImage || isProcessing}
          className="upload-button"
        >
          {isProcessing ? 'Đang xử lý...' : 'Nhận diện vật thể'}
        </button>
      </div>

      <div className="preview-section">
        {imagePreview && (
          <div className="image-preview">
            <img src={imagePreview} alt="Hình ảnh đã chọn" />
          </div>
        )}
      </div>

      <RecognitionResult result={recognitionResult} isProcessing={isProcessing} />
    </div>
  )
}