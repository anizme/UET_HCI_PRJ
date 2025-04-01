export const speak = (text, lang = 'vi-VN') => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = lang
      window.speechSynthesis.speak(utterance)
    } else {
      console.warn('Text-to-speech not supported in this browser')
    }
  }
  
  export const cancelSpeech = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }
  }