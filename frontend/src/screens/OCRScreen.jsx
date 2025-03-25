import { useEffect, useRef } from 'react';
import { API_URL } from '../config';

const OCRScreen = ({ onVoiceCommand }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const speak = (text) => {
    fetch(`${API_URL}/api/tts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    })
      .then((res) => res.json())
      .then((data) => {
        const audio = new Audio(`data:audio/mp3;base64,${data.audio}`);
        audio.play();
      });
  };

  useEffect(() => {
    const setupCamera = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      videoRef.current.play();
      speak('Đưa camera vào văn bản, nói "Chụp" để đọc.');
    };

    setupCamera();

    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'vi-VN';
    recognition.onresult = (event) => {
      const command = event.results[0][0].transcript;
      if (command.toLowerCase().includes('chụp')) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        ctx.drawImage(videoRef.current, 0, 0);
        const imageData = canvas.toDataURL('image/jpeg');

        fetch(`${API_URL}/api/ocr`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: imageData.split(',')[1] }),
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.text) {
              speak(`Văn bản là: ${data.text}`);
            } else {
              speak('Không tìm thấy văn bản.');
            }
          });
      } else {
        onVoiceCommand(command);
      }
    };
    recognition.start();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      }
    };
  }, [onVoiceCommand]);

  return (
    <div>
      <h1>Đọc văn bản</h1>
      <video ref={videoRef} />
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      <p>Đang chờ lệnh "Chụp"...</p>
    </div>
  );
};

export default OCRScreen;