let synth = null;
let initialized = false;

const initializeSpeechSynthesis = () => {
  if (!initialized && 'speechSynthesis' in window) {
    synth = window.speechSynthesis;
    // Fix for mobile Safari
    document.addEventListener('touchstart', () => {
      if (synth) {
        synth.speak(new SpeechSynthesisUtterance(''));
      }
    }, { once: true });
    initialized = true;
  }
};

export const speak = (text, lang = 'vi-VN') => {
  if (!initialized) {
    initializeSpeechSynthesis();
  }

  if (!synth) {
    console.warn('Text-to-speech not supported in this browser');
    return;
  }

  try {
    // Cancel any ongoing speech
    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    
    // Handle errors
    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
    };

    // Ensure speech starts
    utterance.onstart = () => {
      console.log('Speech started');
    };

    // Resume if paused (fixes issue on some mobile browsers)
    if (synth.paused) {
      synth.resume();
    }

    synth.speak(utterance);
  } catch (error) {
    console.error('Error in speech synthesis:', error);
  }
};

export const cancelSpeech = () => {
  if (synth) {
    try {
      synth.cancel();
    } catch (error) {
      console.error('Error canceling speech:', error);
    }
  }
};