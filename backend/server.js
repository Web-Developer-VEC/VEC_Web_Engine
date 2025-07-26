const express = require('express');
const dotenv = require('dotenv');
const connectToDatabase = require('./main-backend/config/db');
const helmet = require('./main-backend/middlewares/helmet_security');
const cors = require('./main-backend/middlewares/cros_security');

dotenv.config({ quiet : true });

const app = express();
const port = process.env.PORT || 5000;

//Loading Main Routes
const mainBackendRoutes = require('./main-backend/routes');


app.set('trust proxy', true ); // Necessary for rate limiter to work correctly

app.use(helmet);
app.use(cors);
// Middleware
app.use(express.json());

// Connect to DBs
connectToDatabase();

// Load modular routes
app.use('/api/main-backend', mainBackendRoutes);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
