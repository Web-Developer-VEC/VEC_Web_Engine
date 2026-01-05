const express = require('express');
const compression = require('compression');
const dotenv = require('dotenv');
const connectToDatabase = require('./main-backend/config/db')
const helmet = require('./main-backend/middlewares/helmet_security');
const cors = require('./main-backend/middlewares/cros_security');
const scheduleResetCounters = require('./main-backend/middlewares/schedulers/reset_hit_counters');
const scheduleMongoHealthCheck = require('./main-backend/middlewares/schedulers/schedule_mongo_healthcheck');
const hitTracker = require('./main-backend/middlewares/hit_tracker')
const session = require("express-session");


dotenv.config({ quiet: true });

const app = express();
const port = process.env.PORT || 5000;

//Loading Main Routes
const mainBackendRoutes = require('./main-backend/routes/landing');


app.set('trust proxy', true); // Necessary for rate limiter to work correctly

app.use(compression());
app.use(helmet);
//app.use(cors);
// Middleware
app.use(express.json());
// Start scheduled task (reset daily counters at midnight)
scheduleResetCounters();
scheduleMongoHealthCheck();

// Connect to DBs
connectToDatabase();
//Global Middleware to track hits for all endpoints
// app.use(hitTracker);

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,   // true in HTTPS
    httpOnly: true,  // prevents JS access
    maxAge: 4 * 60 * 60 * 1000
  }
}));

app.get('/api/main-backend/check-session', (req, res) => {
  const sessionExists = !! req.session;
  res.json({ 
    session: sessionExists ?  'exists' : 'not exists'
  });
});

// Load modular routes
app.use('/api/main-backend', mainBackendRoutes);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
