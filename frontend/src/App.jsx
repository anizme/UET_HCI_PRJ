import { useState } from 'react';
import HomeScreen from './screens/HomeScreen';
import ObjectRecognitionScreen from './screens/ObjectRecognitionScreen';
import OCRScreen from './screens/OCRScreen';
import NewsScreen from './screens/NewsScreen';
import './App.css';

const App = () => {
  const [currentScreen, setCurrentScreen] = useState('home');

  const handleVoiceCommand = (command) => {
    console.log('Received command:', command); // Log lệnh nhận được
    const lowerCommand = command.toLowerCase();
    if (lowerCommand.includes('nhận diện vật thể')) {
      setCurrentScreen('object');
    } else if (lowerCommand.includes('đọc văn bản')) {
      setCurrentScreen('ocr');
    } else if (lowerCommand.includes('tin tức')) {
      setCurrentScreen('news');
    } else if (lowerCommand.includes('quay lại')) {
      setCurrentScreen('home');
    } else {
      console.log('Command not recognized:', lowerCommand); // Log lệnh không khớp
    }
  };

  return (
    <div className="app">
      {currentScreen === 'home' && <HomeScreen onVoiceCommand={handleVoiceCommand} />}
      {currentScreen === 'object' && <ObjectRecognitionScreen onVoiceCommand={handleVoiceCommand} />}
      {currentScreen === 'ocr' && <OCRScreen onVoiceCommand={handleVoiceCommand} />}
      {currentScreen === 'news' && <NewsScreen onVoiceCommand={handleVoiceCommand} />}
    </div>
  );
};

export default App;