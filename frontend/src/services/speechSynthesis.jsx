let synth = window.speechSynthesis || null;
let initialized = false;
let userInteracted = false;
let interactionPromise = null;

const initBlankUtterance = () => {
  // Fix trên mobile: tạo utterance rỗng để "mở quyền" từ người dùng
  if (synth && !synth.speaking) {
    synth.speak(new SpeechSynthesisUtterance(''));
  }
};

export const initializeSpeechSynthesis = () => {
  if (!initialized && 'speechSynthesis' in window) {
    interactionPromise = new Promise((resolve) => {
      const onFirstInteraction = () => {
        userInteracted = true;
        initBlankUtterance();
        removeEventListeners();
        resolve();
      };

      const removeEventListeners = () => {
        window.removeEventListener('click', onFirstInteraction);
        window.removeEventListener('keydown', onFirstInteraction);
        window.removeEventListener('touchstart', onFirstInteraction);
      };

      window.addEventListener('click', onFirstInteraction);
      window.addEventListener('keydown', onFirstInteraction);
      window.addEventListener('touchstart', onFirstInteraction);

      initialized = true;
    });
  }
  return interactionPromise || Promise.resolve(); // resolve nếu đã init từ trước
};

export const speak = (text, lang = 'vi-VN') => {
  return new Promise((resolve) => {
    if (!synth) {
      console.warn('TTS không được hỗ trợ trên trình duyệt này');
      resolve();
      return;
    }

    if (!userInteracted) {
      console.log('Đợi người dùng tương tác trước khi đọc...');
      resolve();
      return;
    }

    if (synth.speaking) {
      synth.cancel(); // tránh bị "interrupted"
      setTimeout(() => speak(text, lang).then(resolve), 250)
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;

    utterance.onerror = (event) => {
      if (event.error !== 'interrupted') {
        console.error('Speech synthesis error:', event);
      }
      resolve();
    };

    utterance.onstart = () => {
      console.log('[TTS] Đang đọc:', text);
    };

    utterance.onend = () => {
      resolve();
    };

    if (synth.paused) synth.resume();
    synth.speak(utterance);
  });
};

export const cancelSpeech = () => {
  if (synth && synth.speaking) {
    synth.cancel();
  }
};
