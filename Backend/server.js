const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectToDatabase = require('./Hostel/config/db');
const session = require('./Hostel/config/session');

// importing Routes for Main College Page
const departmentRoutes = require('./Main/routes/department');
const eventRoutes = require('./Main/routes/events');
const announcementRoutes = require('./Main/routes/announcements');
const principalRoutes = require('./Main/routes/principal');
const adminRoutes = require('./Main/routes/admin');
const committieeRoutes = require('./Main/routes/committee');
const regulationRoutes = require('./Main/routes/regulation');
const intakesRoutes = require('./Main/routes/intake');
const placementRoutes = require('./Main/routes/placement');
const allformsRoutes = require('./Main/routes/allform');
const alumniRoutes = require('./Main/routes/alumni');
const deanRoutes = require('./Main/routes/dean');
const bannerRoutes = require('./Main/routes/banner');
const secondnavbarController = require('./Main/routes/secondnavbar');
const staffprofileRoutes = require('./Main/routes/staffprofile');
const sportsDataRoutes = require('./Main/routes/sports');
const libraryRoutes = require('./Main/routes/library');
const NNYClubRoutes = require('./Main/routes/NNYClub');
const overallResearchRoutes = require('./Main/routes/overallResearch');
const grievanceRoutes = require('./Main/routes/grievance');
const wardenRoutes = require('./Main/routes/wardens');
const incubationRoutes = require('./Main/routes/incubation');
// Importing route files For Hostel Page
const loginRoute = require('./Hostel/routes/auth');
const studentRequestRoute = require('./Hostel/routes/studentRoutes/request');
const studentPreRequestRoute = require('./Hostel/routes/studentRoutes/preRequest');
const studentProfileRoute = require('./Hostel/routes/studentRoutes/studentProfile');
const studentVacateRoute = require('./Hostel/routes/studentRoutes/vacate');
const securityRoute = require('./Hostel/routes/securityRoute/security');
const wardenDetailsRoute = require('./Hostel/routes/wardenRoutes/sidebar');
const wardenAttendanceRoute = require('./Hostel/routes/wardenRoutes/attendance');
const wardenRequestRoute = require('./Hostel/routes/wardenRoutes/request');
const wardenStudentRoute = require('./Hostel/routes/wardenRoutes/studentData');
const wardenAnalysisRoute = require('./Hostel/routes/wardenRoutes/analysis');
const superiorAnalysisRoute = require('./Hostel/routes/superiorRoute/analysis');
const superiorAttendanceRoute = require('./Hostel/routes/superiorRoute/attendance');
const superiorRequestRoute = require('./Hostel/routes/superiorRoute/request');
const superiorStudentRoute = require('./Hostel/routes/superiorRoute/superiorStudent');
const superiorWardensProfileRoute = require('./Hostel/routes/superiorRoute/wardensprofile');

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(session);

// Connect to MongoDB
connectToDatabase();


// Routes for main college Page
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
app.use('/api', incubationRoutes);
// Routes For Hostel Page
app.use('/api', loginRoute);
app.use('/api', studentRequestRoute);
app.use('/api', studentPreRequestRoute);
app.use('/api', studentProfileRoute);
app.use('/api', studentVacateRoute);
app.use('/api', securityRoute);
app.use('/api', wardenDetailsRoute);
app.use('/api', wardenAttendanceRoute);
app.use('/api', wardenRequestRoute);
app.use('/api', wardenStudentRoute);
app.use('/api', wardenAnalysisRoute);
app.use('/api', superiorAnalysisRoute);
app.use('/api', superiorAttendanceRoute);
app.use('/api', superiorRequestRoute);
app.use('/api', superiorStudentRoute);
app.use('/api', superiorWardensProfileRoute);

app.get('/', (req, res) => {
    res.send("Welcome to the Node.js MongoDB API!");
});

// Start the server
app.listen(port, () => {
    console.log(`🚀 Server running at http://localhost:${port}`);
});
