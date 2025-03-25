import { useEffect, useState } from 'react';
import { API_URL } from '../config';

const NewsScreen = ({ onVoiceCommand }) => {
  const [query, setQuery] = useState('');

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

  const fetchNews = (searchQuery) => {
    fetch(`${API_URL}/api/news?query=${searchQuery}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.news && data.news.length > 0) {
          speak(`Tin tức: ${data.news[0]}`);
        } else {
          speak('Không tìm thấy tin tức.');
        }
      });
  };

  useEffect(() => {
    speak('Bạn muốn nghe tin tức về gì? Ví dụ: thời tiết, thể thao.');
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'vi-VN';
    recognition.onresult = (event) => {
      const command = event.results[0][0].transcript;
      if (!command.toLowerCase().includes('quay lại')) {
        setQuery(command);
        fetchNews(command);
      } else {
        onVoiceCommand(command);
      }
    };
    recognition.start();
  }, [onVoiceCommand]);

  return (
    <div>
      <h1>Tin tức</h1>
      <p>Đang chờ yêu cầu của bạn...</p>
    </div>
  );
};

export default NewsScreen;