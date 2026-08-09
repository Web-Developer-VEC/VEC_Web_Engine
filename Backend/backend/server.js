const express = require('express');
const compression = require('compression');
const dotenv = require('dotenv');
const connectToDatabase = require('./main-backend/config/db')
const helmet = require('./main-backend/middlewares/helmet_security');
const cors = require('./main-backend/middlewares/cros_security');
const scheduleResetCounters = require('./main-backend/middlewares/schedulers/reset_hit_counters');
const scheduleMongoHealthCheck = require('./main-backend/middlewares/schedulers/schedule_mongo_healthcheck');
const hitTracker = require('./main-backend/middlewares/hit_tracker')
const http = require("http");
const { Server } = require("socket.io");

dotenv.config({ quiet: true });

const app = express();
const port = process.env.PORT || 5000;

//Loading Main Routes
const mainBackendRoutes = require('./main-backend/routes/landing');
const startHitResetCron = require('./main-backend/middlewares/cron');


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
app.use(hitTracker);

// Load modular routes
app.use('/api/main-backend', mainBackendRoutes);

startHitResetCron();

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});
app.set("io", io);

io.on("connection", (socket) => {
  console.log("Client connected to WebSocket:", socket.id);

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
