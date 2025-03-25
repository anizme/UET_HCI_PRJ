const express = require('express');
const router = express.Router();
const tf = require('@tensorflow/tfjs');
const cocoSsd = require('@tensorflow-models/coco-ssd');
const { createWorker } = require('tesseract.js');
const gTTS = require('gtts');
const { createCanvas, loadImage } = require('canvas');
const fs = require('fs').promises; // Thêm fs để xử lý file

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

module.exports = router;