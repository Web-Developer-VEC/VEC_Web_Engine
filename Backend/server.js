const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const staffRoutes = require('./routes/staffRoutes');

dotenv.config();

// Connect to the database
connectDB();

const app = express();

// Enable CORS for all routes
app.use(cors());

// Parse incoming requests with JSON payloads
app.use(express.json());

// Routes
app.use('/api/staff', staffRoutes);

// Root Route
app.get('/', (req, res) => res.send('API is running'));

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
