const express = require('express');
const router = express.Router();
const tf = require('@tensorflow/tfjs');
const cocoSsd = require('@tensorflow-models/coco-ssd');
const { createWorker } = require('tesseract.js');
const gTTS = require('gtts');
const { createCanvas, loadImage } = require('canvas');
const fs = require('fs').promises; // Thêm fs để xử lý file

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



// API Object Recognition
router.post('/object-recognition', async (req, res) => {
  try {
    const { image } = req.body;
    if (!image) return res.status(400).json({ error: 'No image provided' });

    const buffer = Buffer.from(image, 'base64');
    const img = await loadImage(buffer);

    const canvas = createCanvas(img.width, img.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);

    const model = await cocoSsd.load();
    const predictions = await model.detect(canvas);

    const object = predictions.length > 0 ? predictions[0].class : 'Không nhận diện được';
    res.json({ object });
  } catch (error) {
    console.error('Object Recognition Error:', error);
    res.status(500).json({ error: 'Error processing image', details: error.message });
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
    res.json({title: currentNews.title, content: htmlContent})
  } catch (error) {
    res.status(500).json({ success: false, message: `Failed to fetch '${news.title}' from RSS feed`, error });
  }
})

module.exports = router;