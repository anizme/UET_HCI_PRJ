let recognition = null

export const startListening = (onResult) => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
  
  if (!SpeechRecognition) {
    console.error('Speech recognition not supported')
    return
  }

  recognition = new SpeechRecognition()
  recognition.lang = 'vi-VN'
  recognition.interimResults = false
  recognition.maxAlternatives = 1

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript
    onResult(transcript)
  }

  recognition.onerror = (event) => {
    console.error('Speech recognition error', event.error)
  }

  recognition.start()
}

export const stopListening = () => {
  if (recognition) {
    recognition.stop()
    recognition = null
  }
}