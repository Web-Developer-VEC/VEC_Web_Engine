const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectToDatabase = require('./config/db');

// Importing route files
const departmentRoutes = require('./routes/department');
const eventRoutes = require('./routes/events');
const announcementRoutes = require('./routes/announcements');
const principalRoutes = require('./routes/principal');
const adminRoutes = require('./routes/admin');
const committieeRoutes = require('./routes/committee');
const regulationRoutes = require('./routes/regulation');
const intakesRoutes = require('./routes/intake');
const placementRoutes = require('./routes/placement');
const allformsRoutes = require('./routes/allform');
const alumniRoutes = require('./routes/alumni');
const deanRoutes = require('./routes/dean');
const bannerRoutes = require('./routes/banner');
const secondnavbarController = require('./routes/secondnavbar');
const staffprofileRoutes = require('./routes/staffprofile');
const sportsDataRoutes = require('./routes/sports');
const libraryRoutes = require('./routes/library');
const NNYClubRoutes = require('./routes/NNYClub');
const overallResearchRoutes = require('./routes/overallResearch');
const grievanceRoutes = require('./routes/grievance');
const wardenRoutes = require('./routes/wardens')

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
app.use('/api', eventRoutes);
app.use('/api', announcementRoutes);
app.use('/api', principalRoutes);
app.use('/api', adminRoutes);
app.use('/api', committieeRoutes);
app.use('/api', regulationRoutes);
app.use('/api', intakesRoutes);
app.use('/api', placementRoutes);
app.use('/api', allformsRoutes);
app.use('/api', alumniRoutes);
app.use('/api', deanRoutes);
app.use('/api', bannerRoutes);
app.use('/api', secondnavbarController);
app.use('/api', staffprofileRoutes);
app.use('/api', sportsDataRoutes);
app.use('/api', libraryRoutes);
app.use('/api', NNYClubRoutes);
app.use('/api', overallResearchRoutes);
app.use('/api', grievanceRoutes);
app.use('/api', wardenRoutes);

app.get('/', (req, res) => {
    res.send("Welcome to the Node.js MongoDB API!");
});

// Start the server
app.listen(port, () => {
    console.log(`🚀 Server running at http://localhost:${port}`);
});
