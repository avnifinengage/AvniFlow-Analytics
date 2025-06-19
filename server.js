require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const eventsRoute = require('./backend/routes/events');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Correct environment variable name
console.log('MONGO_URI:', process.env.MONGO_URI);

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

app.use('/api/events', eventsRoute);

app.get('/', (req, res) => {
  res.send('Hello from Web3 Funnel Widget backend!');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
