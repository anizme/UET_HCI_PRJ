import { useEffect, useState } from 'react';
import { API_URL } from '../config';

const HomeScreen = ({ onVoiceCommand }) => {
  const [isStarted, setIsStarted] = useState(false);

  const speak = (text) => {
    fetch(`${API_URL}/api/tts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    })
      .then((res) => res.json())
      .then((data) => {
        const audio = new Audio(`data:audio/mp3;base64,${data.audio}`);
        audio.play().catch((err) => console.error('Audio Play Error:', err));
      })
      .catch((err) => console.error('Fetch TTS Error:', err));
  };

  const startListening = () => {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'vi-VN';
    recognition.onresult = (event) => {
      const command = event.results[0][0].transcript;
      console.log('Recognized command:', command); // Log lệnh nhận diện
      onVoiceCommand(command);
    };
    recognition.onerror = (err) => {
      console.error('Speech Recognition Error:', err); // Log lỗi
      speak('Không nhận diện được giọng nói, thử lại nhé.');
    };
    recognition.onend = () => {
      console.log('Speech Recognition ended, restarting...');
      startListening(); // Tự động khởi động lại để liên tục lắng nghe
    };
    recognition.start();
    console.log('Speech Recognition started');
  };

  useEffect(() => {
    if (isStarted) {
      speak('Chào bạn, nói "Bắt đầu" để sử dụng. Các lệnh: Nhận diện vật thể, Đọc văn bản, Tin tức.');
      startListening();
    }
  }, [isStarted]);

  return (
    <div>
      <h1>Hệ thống hỗ trợ người khiếm thị</h1>
      {!isStarted && (
        <button onClick={() => setIsStarted(true)}>Bắt đầu</button>
      )}
      {isStarted && <p>Đang lắng nghe lệnh...</p>}
    </div>
  );
};

export default HomeScreen;