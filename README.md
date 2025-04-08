# HCI project supports for visually impared people

## Yêu cầu hệ thống:
- Node.js: Dùng cho BE (Node.js/Express)
- NPM: Dùng cho FE (React)

## Cài đặt và chạy FE:
- cd frontend
- npm install: Cài đặt dependencies, không push node_modules lên git vì nặng nên tự install các dependencies ở local
- npm run dev -- --host: Chạy server. Chọn 1 url mà VITE liệt kê Netwwork:... Chép ip vào BASE_URL trong frontend/src/services/api. Mục đích là fetch được api của backend

## Cài đặt và chạy BE:
- cd backend
- cd install
- Sửa .env nếu cần: tạm thời mặc định port, thích thì sửa
- npm run dev: Chạy server

## Cách dùng sau khi chạy:
- Vào home, ấn bắt đầu, nghe giọng hướng dẫn
- Đọc command theo hướng dẫn
- Muốn quay lại home thì đọc quay lại


### Ghi chú:
- Không push node_modules lên git (đã add vào .gitignore rồi, đừng xóa)
- Hiện tại thì folder screens không có ý nghĩa, nó bị out of date nhưng mà để đấy để khi cần chép code
- Setup api key: 
    - Vào commit "feat: support capturing image through camera, set up ssl" ở nhánh dev_object_recognition -> Tạo 2 file localhost-key.pem và localhost.pem tương ứng ở frontend. 
    - Thêm file .env ở backend và pase dòng GEMINI_API vào (trong nhóm mes)
    - Bật cmd -> ipconfig -> copy IPV4 Address của Wireless LAN adapter Wi-Fi rồi pase vào vite.config.js ở frontend (phần proxy target)