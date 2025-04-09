import { speak } from '../services/speechSynthesis'
import './RecognitionResult.css'

export default function RecognitionResult({ result, isProcessing }) {
  const readResult = () => {
    if (result) {
      speak(result)
    } else {
      speak('Chưa có kết quả nhận diện.')
    }
  }

  return (
    <div className="result-section">
      <h3>Mô tả môi trường:</h3>
      <div className="result-frame">
        {result ? (
          <p>{result}</p>
        ) : (
          <p className="placeholder-text">Kết quả nhận diện sẽ hiển thị ở đây...</p>
        )}
      </div>
      <button onClick={readResult} disabled={!result || isProcessing}>
        Đọc mô tả
      </button>
    </div>
  )
}