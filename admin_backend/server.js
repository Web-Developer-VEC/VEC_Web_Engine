const express = require('express');
const session = require('express-session');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const { connectToDatabase } = require('./config/db');

dotenv.config({ quiet: true });
process.removeAllListeners('warning');
process.on('warning', (warning) => {
  if (!warning.message.includes('AWS SDK for JavaScript (v2) is in maintenance mode')) {
    console.warn(warning);
  }
});

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(bodyParser.json());
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || '12345678',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }
}));


// Routes
const routes = require('./routes');
app.use('/api', routes);

// Start server after DB connection
connectToDatabase().then(() => {
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
});
