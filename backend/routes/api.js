const express = require('express');
const router = express.Router();
const { createWorker } = require('tesseract.js');
const gTTS = require('gtts');
const fs = require('fs').promises; // Thêm fs để xử lý file
const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');
dotenv.config();

// Khởi tạo Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Kiểm tra API key
if (!process.env.GEMINI_API_KEY) {
  console.warn('GEMINI_API_KEY không được cấu hình trong file .env');
}

// API Object Recognition sử dụng Gemini Flash API
router.post('/object-recognition', async (req, res) => {
  try {
    const { image } = req.body;
    if (!image) return res.status(400).json({ error: 'No image provided' });

    // Kiểm tra API key
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ 
        error: 'Gemini API key is missing', 
        details: 'Please configure GEMINI_API_KEY in .env file' 
      });
    }

    // Khởi tạo model Gemini Flash
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    // Tạo prompt cho Gemini - Mô tả ngắn gọn cho người khiếm thị
    const prompt = "Hãy mô tả ngắn gọn hình ảnh này bằng tiếng Việt cho người khiếm thị. Chỉ tập trung vào các đối tượng chính và vị trí tương đối của chúng. Mô tả trong 5-6 câu ngắn, đơn giản, dễ hiểu. Chỉ nêu những thông tin quan trọng nhất mà người khiếm thị cần biết để hiểu được nội dung chính của hình ảnh.";
    
    // Chuẩn bị dữ liệu hình ảnh
    const imageData = {
      inlineData: {
        data: image,
        mimeType: "image/jpeg"
      }
    };
    
    // Gọi Gemini API để phân tích hình ảnh
    const result = await model.generateContent([prompt, imageData]);
    const response = await result.response;
    const detailedDescription = response.text();
    
    // Trả về kết quả
    res.json({
      object: "Đã phân tích", // Giữ lại để tương thích ngược
      description: detailedDescription,
      // Thêm thông tin chi tiết từ Gemini
      gemini_response: {
        model: "gemini-1.5-flash"
      }
    });
  } catch (error) {
    console.error('Object Recognition Error:', error);
    res.status(500).json({ 
      error: 'Error processing image', 
      details: error.message,
      hint: error.message.includes('API key') ? 'Vui lòng kiểm tra GEMINI_API_KEY trong file .env' : undefined
    });
  }
});

// API OCR
router.post('/ocr', async (req, res) => {
  try {
    const { image } = req.body;
    if (!image) return res.status(400).json({ error: 'No image provided' });

    const worker = await createWorker('eng+vie');
    const buffer = Buffer.from(image, 'base64');
    const { data: { text } } = await worker.recognize(buffer);
    await worker.terminate();

    res.json({ text: text.trim() || 'Không tìm thấy văn bản' });
  } catch (error) {
    console.error('OCR Error:', error);
    res.status(500).json({ error: 'Error processing OCR', details: error.message });
  }
});

// API Text-to-Speech (Sửa lại)
router.post('/tts', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'No text provided' });

    console.log('Generating TTS for:', text); // Log để debug
    const gtts = new gTTS(text, 'vi');

    // Tạo file tạm thời
    const tempFilePath = './temp-audio.mp3';
    await new Promise((resolve, reject) => {
      gtts.save(tempFilePath, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Đọc file thành base64
    const audioBuffer = await fs.readFile(tempFilePath);
    const audioBase64 = audioBuffer.toString('base64');

    // Xóa file tạm
    await fs.unlink(tempFilePath);

    res.json({ audio: audioBase64 });
  } catch (error) {
    console.error('TTS Error:', error);
    res.status(500).json({ error: 'Error generating audio', details: error.message });
  }
});

module.exports = router;