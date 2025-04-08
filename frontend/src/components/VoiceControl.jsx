import { useState, useEffect } from 'react'
import { startListening, stopListening } from '../services/voiceRecognition'
import { speak } from '../services/speechSynthesis'

export default function VoiceControl({ isListening, setIsListening, onNavigate }) {
  const [voiceCommand, setVoiceCommand] = useState('')

  const handleVoiceCommand = (command) => {
    setVoiceCommand(command)
    
    const normalizedCommand = command.toLowerCase()
    
    if (normalizedCommand.includes('trang chủ')) {
      onNavigate('home')
    } else if (normalizedCommand.includes('nhận diện văn bản')) {
      onNavigate('ocr')
    } else if (normalizedCommand.includes('nhận diện vật thể')) {
      onNavigate('object')
    } else if (normalizedCommand.includes('tin tức')) {
      onNavigate('news')
    } else if (normalizedCommand.includes('dừng')) {
      setIsListening(false)
    }
  }

  useEffect(() => {
    if (isListening) {
      speak('Đang lắng nghe...')
      startListening(handleVoiceCommand)
    } else {
      speak('Đã dừng lắng nghe.')
      stopListening()
    }

    return () => {
      stopListening()
    }
  }, [isListening])

  return (
    <div className="voice-control">
      <button 
        onClick={() => setIsListening(!isListening)}
        aria-label={isListening ? 'Dừng nhận diện giọng nói' : 'Bắt đầu nhận diện giọng nói'}
      >
        {isListening ? '🛑 Dừng' : '🎤 Bắt đầu'}
      </button>
      {voiceCommand && <p className="voice-command">Lệnh: {voiceCommand}</p>}
    </div>
  )
}