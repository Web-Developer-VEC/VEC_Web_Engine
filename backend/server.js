const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet'); 
const connectToDatabase = require('./main-backend/config/db')

dotenv.config({ quiet : true });

const app = express();
const port = process.env.PORT || 5000;

//Loading Main Routes
const mainBackendRoutes = require('./main-backend/routes');


app.set('trust proxy', true ); // Necessary for rate limiter to work correctly

app.use(helmet());
// Middleware
app.use(cors());
app.use(express.json());

app.use(cors({
  origin: 'https://your-frontend-domain.com',
  methods: ['GET', 'POST'],
}));

// Connect to DBs
connectToDatabase();

// Load modular routes
app.use('/api/main-backend', mainBackendRoutes);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
