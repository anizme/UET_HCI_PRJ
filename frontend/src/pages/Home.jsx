import { useEffect } from 'react';
import { speak, initializeSpeechSynthesis } from '../services/speechSynthesis';

export default function Home() {

  return (
    <div className="home-page">
      <h2>Trang chủ</h2>
      <div className="welcome-message">
        <p>Xin chào! Đây là ứng dụng hỗ trợ người khiếm thị với các tính năng:</p>
        <ul className="feature-list">
          <li>
            <strong>Nhận diện văn bản (OCR):</strong> Chụp ảnh hoặc tải lên hình ảnh chứa văn bản để ứng dụng đọc nội dung cho bạn
          </li>
          <li>
            <strong>Nhận diện vật thể:</strong> Sử dụng camera để nhận diện các vật thể xung quanh bạn
          </li>
          <li>
            <strong>Tin tức:</strong> Nghe các tin tức mới nhất theo chủ đề bạn quan tâm
          </li>
          <li>
            <strong>Điều khiển bằng giọng nói:</strong> Sử dụng nút micrô để điều hướng bằng giọng nói
          </li>
        </ul>
        <p>Hãy chọn một tính năng từ menu điều hướng để bắt đầu.</p>
      </div>

      <div className="quick-actions">
        <h3>Hướng dẫn nhanh:</h3>
        <div className="voice-commands">
          <p>Bạn có thể sử dụng các lệnh giọng nói sau:</p>
          <ul>
            <li>"Trang chủ" - Để quay về trang này</li>
            <li>"Nhận diện văn bản" - Mở công cụ OCR</li>
            <li>"Nhận diện vật thể" - Mở công cụ nhận diện vật thể</li>
            <li>"Tin tức" - Mở trang tin tức</li>
            <li>"Dừng" - Tắt nhận diện giọng nói</li>
          </ul>
        </div>
      </div>
    </div>
  );
}