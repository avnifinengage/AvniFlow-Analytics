require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

// Import routes
const eventRoutes = require('./routes/events');
const websiteRoutes = require('./routes/websites');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, '../public')));

app.get('/', (req, res) => {
  res.send('Hello World from main app');
});

app.listen(PORT, () => {
  console.log(`Minimal main app running on port ${PORT}`);
}); 