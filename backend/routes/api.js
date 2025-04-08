const express = require('express');
const router = express.Router();
const { createWorker } = require('tesseract.js');
const sharp = require('sharp');
const langdetect = require('langdetect');
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

const rss_parser = require('rss-parser')
const rssParser = new rss_parser()
const cheerio = require('cheerio');
// News list
let cachedNewsList = []

const newsTopics = [
  "tin-moi-nhat",
  "the-gioi",
  "thoi-su",
  "kinh-doanh",
  "startup",
  "giai-tri",
  "the-thao",
  "phap-luat",
  "giao-duc",
  "tin-moi-nhat",
  "tin-noi-bat",
  "suc-khoe",
  "gia-dinh",
  "du-lich",
  "khoa-hoc",
  "cong-nghe",
  "oto-xe-may",
  "y-kien",
  "tam-su",
  "cuoi",
  "tin-xem-nhieu"
]



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
        model: "gemini-2.0-flash"
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
    const prompt = "Phân tích hình ảnh và trả về: 1) Ngôn ngữ được sử dụng trong văn bản (ví dụ: vietnamese, english, v.v.), 2) Nội dung đầy đủ của văn bản theo ngôn ngữ đó. Hãy phản hồi theo cấu trúc 'LANGUAGE: [tên ngôn ngữ]\\n\\nCONTENT: [nội dung văn bản]'";

    // Chuẩn bị dữ liệu hình ảnh
    const imageData = {
      inlineData: {
        data: image,
        mimeType: "image/jpeg"
      }
    };

    const result = await model.generateContent([prompt, imageData]);
    const response = await result.response;
    const responseText = response.text();

    // Phân tích kết quả để tách ngôn ngữ và nội dung
    let language = "unknown";
    let content = responseText;

    // Tìm phần LANGUAGE và CONTENT từ phản hồi
    const languageMatch = responseText.match(/LANGUAGE:\s*(.*?)(?=\n\n|\n|$)/i);
    const contentMatch = responseText.match(/CONTENT:\s*([\s\S]*?)$/i);

    if (languageMatch && languageMatch[1]) {
      language = languageMatch[1].trim();
    }

    if (contentMatch && contentMatch[1]) {
      content = contentMatch[1].trim();
    }

    // Trả về kết quả
    res.json({
      description: content,
      language: language,
      // Thêm thông tin chi tiết từ Gemini
      gemini_response: {
        model: "gemini-2.0-flash"
      }
    });
  } catch (error) {
    console.error('OCR Error:', error);
    res.status(500).json({
      error: 'Error processing image',
      details: error.message,
      hint: error.message.includes('API key') ? 'Vui lòng kiểm tra GEMINI_API_KEY trong file .env' : undefined
    });
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

// Lấy tin tức từ vne, chuyển về danh sách các tin theo tên và index
router.get('/fetch-news/:channel', async (req, res) => {
  const channel = req.params.channel || 'tin-moi-nhat'
  try {
    const feed = await rssParser.parseURL(`https://vnexpress.net/rss/${channel}.rss`);
    cachedNewsList = feed.items.map((item, index) => ({
      index: index,
      title: item.title,
      link: item.link,
      pubDate: item.pubDate,
      description: item.contentSnippet,
      channel: channel
    }));
    res.json({ success: true, news: cachedNewsList });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch RSS feed', error });
  }
});

router.post('/fetch-news/', async (req, res) => {
  console.log(req.body)
  const news = req.body.news
  try {
    const currentNews = news
    const htmlNews = await fetch(currentNews.link).then(response => response.text())


    const $ = cheerio.load(htmlNews);
    $('a').each((index, element) => {
      $(element).removeAttr('href');
    });

    const parsedHTML = $('.fck_detail p').map((index, element) => `<p>${$(element).html()}</p>`).get().join("");
    const title = "" //`<title_detail>${currentNews.title}<title_detail>`
    const description = `<p>${currentNews.description}<p>`
    const htmlContent = `${title}${description}${parsedHTML}`
    res.json({ title: currentNews.title, content: htmlContent })
  } catch (error) {
    res.status(500).json({ success: false, message: `Failed to fetch '${news.title}' from RSS feed`, error });
  }
})

module.exports = router;