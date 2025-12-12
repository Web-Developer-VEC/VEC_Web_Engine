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
    secret: "vec_secret_key_123",  // change to strong key
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false,
      maxAge: 60 * 60 * 1000
     }   // secure: true only when using HTTPS
}));

// Load modular routes
app.use('/api/main-backend', mainBackendRoutes);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
