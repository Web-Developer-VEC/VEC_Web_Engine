const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectToDatabase = require('./main-backend/config/db')

dotenv.config({ quiet : true });

const app = express();
const port = process.env.PORT || 5000;

//Loading Main Routes
const mainBackendRoutes = require('./main-backend/routes');

// Middleware
app.use(cors());
app.use(express.json());

// Connect to DBs
connectToDatabase();

// Load modular routes
app.use('/api/main-backend', mainBackendRoutes);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
