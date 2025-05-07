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
  recognition.continuous = true

  recognition.onresult = (event) => {
    const lastResultIndex = event.results.length - 1
    const transcript = event.results[lastResultIndex][0].transcript
    onResult(transcript)
  }

  recognition.onerror = (event) => {
    console.error('Speech recognition error', event.error)
  }
  
  recognition.onend = () => {
    // Restart recognition when it ends to maintain continuous listening
    if (recognition) {
      recognition.start()
    }
  }

  recognition.start()
}

export const stopListening = () => {
  if (recognition) {
    recognition.stop()
    recognition = null
  }
}