import { useEffect } from 'react';
import { speak, initializeSpeechSynthesis } from '../services/speechSynthesis';
import './Home.css';

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
            <li><strong>Điều hướng:</strong></li>
            <ul>
              <li>"Trang chủ" - Để quay về trang này</li>
              <li>"Nhận diện văn bản" - Mở công cụ OCR</li>
              <li>"Nhận diện vật thể" - Mở công cụ nhận diện vật thể</li>
              <li>"Tin tức" - Mở trang tin tức</li>
              <li>"Dừng" - Tắt nhận diện giọng nói</li>
            </ul>
            

            <li><strong>Kích hoạt các nút chức năng:</strong></li>
            <ul>
              <li>"Tải lên / Camera" - Chuyển đổi giữa 2 tab "Tải lên hình ảnh" và "Sử dụng camera"</li>
              <li>"Bật cam" - Kích hoạt camera</li>
              <li>"Tắt cam" - Tắt camera</li>
              <li>"Chụp ảnh" - Chụp ảnh hiện tại</li>
              <li>"Nhận diện" - Kích hoạt nhận diện thời gian thực</li>
              <li>"Tắt nhận diện" - Tắt nhận diện thời gian thực</li>
              <li>"Nhận diện văn bản" - Kích hoạt nhận diện văn bản trong hình ảnh</li>
              <li>"Đọc kết quả" - Đọc kết quả nhận diện</li>
              <li>"Chọn chủ đề <strong><em>tin tức</em></strong>" - Chọn chủ đề của tin tức bạn muốn nghe, như <em>Tin mới nhất, Thế giới, Thời sự, Thể thao, Công nghệ, Giải trí, Xe</em>.</li>
              <li>"Chọn bài viết số ..." - Chọn bài viết bạn muốn nghe.</li>
              <li>"Đọc bài viết" - Đọc bài viết bạn đã chọn</li>
              <li>"Trang trước/Trang sau" - Chuyển đổi trang chứa các tin tức về chủ đề bạn đã chọn</li>
            </ul>
            
            

            <li><strong>Công cụ hỗ trợ:</strong></li>
            <ul>
              <li>"Tăng chữ" - Phóng to văn bản</li>
              <li>"Giảm chữ" - Thu nhỏ văn bản</li>
              <li>"Chế độ tối" - Bật/tắt chế độ tối</li>
              <li>"Tương phản cao" - Bật/tắt chế độ tương phản cao</li>
            </ul>
            
          </ul>
        </div>
      </div>
    </div>
  );
}