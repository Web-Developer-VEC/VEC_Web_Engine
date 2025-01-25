const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectToDatabase = require('./config/db');

// Importing route files
const departmentRoutes = require('./routes/department');
const eventRoutes = require('./routes/events');
const announcementRoutes = require('./routes/announcements');
const principalRoutes = require('./routes/principal');

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectToDatabase();

// Routes
app.use('/api', departmentRoutes);
app.use('/api/events', eventRoutes);
app.use('/api', announcementRoutes);
app.use('/api', principalRoutes);

app.get('/', (req, res) => {
    res.send("Welcome to the Node.js MongoDB API!");
});

// Start the server
app.listen(port, () => {
    console.log(`🚀 Server running at http://localhost:${port}`);
});
