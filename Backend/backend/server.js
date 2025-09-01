const express = require('express');
const dotenv = require('dotenv');
const connectToDatabase = require('./main-backend/config/db')
const connectToAdminDatabase = require("./admin-backend/config/db")
const helmet = require('./main-backend/middlewares/helmet_security');
// const cors = require('./main-backend/middlewares/cros_security');
const cors = require('cors');
const scheduleResetCounters = require('./main-backend/middlewares/schedulers/reset_hit_counters');
const scheduleMongoHealthCheck = require('./main-backend/middlewares/schedulers/schedule_mongo_healthcheck');
const hitTracker = require('./main-backend/middlewares/hit_tracker');
const session = require('express-session');
const MongoStore = require('connect-mongo');

dotenv.config({ quiet : true });

const app = express();
const port = process.env.PORT || 5000;

//Loading Main Routes
const mainBackendRoutes = require('./main-backend/routes/landing');
const typeRoutes = require('./admin-backend/routes');


app.set('trust proxy', true ); // Necessary for rate limiter to work correctly

app.use(helmet);
//app.use(cors);
// Middleware
app.use(express.json());


app.use(cors({
  origin: "http://localhost:3000", // your React app
  credentials: true               // allow cookies/auth headers
}));

app.use(session({
  secret: process.env.JWT_KEY || "your-secret-key",

  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI || "mongodb://127.0.0.1:27017/admin_sessions",
    ttl: 24 * 60 * 60 // 1 day
  }),
  cookie: {
    secure: false, // set true if HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 1 day
  }
}));
// Start scheduled task (reset daily counters at midnight)
scheduleResetCounters();
scheduleMongoHealthCheck();

// Connect to DBs
connectToDatabase();
connectToAdminDatabase();
//Global Middleware to track hits for all endpoints
app.use(hitTracker);

// Load modular routes
app.use('/api/main-backend', mainBackendRoutes);
app.use('/api/admin-backend',typeRoutes);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
