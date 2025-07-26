const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectToDatabase = require('./main-backend/config/db')
const scheduleResetCounters = require('./main-backend/middlewares/reset_scheduler');
const hitTracker = require('./main-backend/middlewares/hit_tracker');

dotenv.config({ quiet : true });

const app = express();
const port = process.env.PORT || 5000;

//Loading Main Routes
const mainBackendRoutes = require('./main-backend/routes');


app.set('trust proxy', true ); // Necessary for rate limiter to work correctly


// Middleware
app.use(cors());
app.use(express.json());
// Start scheduled task (reset daily counters at midnight)
scheduleResetCounters();


// Connect to DBs
connectToDatabase();
//Global Middleware to track hits for all endpoints
app.use(hitTracker);

// Load modular routes
app.use('/api/main-backend', mainBackendRoutes);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
