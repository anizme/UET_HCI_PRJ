const app = require('./app');
const https = require('https');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 5000;

const options = {
  key: fs.readFileSync(path.join(__dirname, '..', 'frontend', 'localhost-key.pem')),
  cert: fs.readFileSync(path.join(__dirname, '..', 'frontend', 'localhost.pem'))
};

https.createServer(options, app).listen(PORT, '0.0.0.0', () => {
  console.log(`HTTPS Server running on port ${PORT}`);
});