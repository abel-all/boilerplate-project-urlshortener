require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dns = require('dns');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded());
app.use('/public', express.static(`${process.cwd()}/public`));
const urls = [];
app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.post('/api/shorturl', (req, res) => {
  const url = req.body.url;
  const urlObj = new URL(url);
  if (urlObj.protocol !== "https:" && urlObj.protocol !== "http:") {
    return res.json({ error: 'invalid url' });
  }
  if (!urlObj.hostname || urlObj.hostname.split('.').length < 2) {
    return res.json({ error: 'invalid url' });
  }
  dns.lookup(urlObj.hostname, (err, address, family) => {
    if (err) {
      res.json({ error: "Invalid Hostname" })
    }
    else {
      urls.push(url)
      res.json({ original_url : url, short_url : urls.length });
    }
  })
});

app.get('/api/shorturl/:shorturl', (req, res) => {
  const { shorturl } = req.params;
  try {
    const redUrl = urls[shorturl - 1];
    res.redirect(redUrl);
  } catch (error) {
    res.json({ error: "No short URL found for the given input" })
  }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
