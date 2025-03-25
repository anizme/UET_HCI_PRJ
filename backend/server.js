const app = require('./app');

const PORT = process.env.PORT || 5000;

// Thay app.listen(PORT) thành:
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});