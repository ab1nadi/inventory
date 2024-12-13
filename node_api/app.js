const express = require('express');
const app = express();
const v1API = require('./src/v1/v1')
const cors = require('cors');

// Allow requests from your Svelte frontend's origin
app.use(cors({
  origin: process.env.FRONT_END_ORIGIN, // Allow requests from your Svelte app's URL
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Specify allowed methods if needed
  allowedHeaders: ['Content-Type', 'Authorization'], // Specify allowed headers if needed
}));


app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies


app.use('', (req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});

app.use('/v1', v1API)


const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
