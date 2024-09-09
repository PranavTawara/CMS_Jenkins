const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config(); // Load environment variables

const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors());
// Check if the environment variable is loaded
console.log('ACCESS_TOKEN_SECRET:', process.env.ACCESS_TOKEN_SECRET);

app.use(express.json());

// Add your routes and middlewares
const router = require('./router/router');
app.use('/api', router);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
