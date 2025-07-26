const express = require('express');
const router = express.Router();

// Route groups
router.use('/auth', require('./auth/login'));
router.use('/auth', require('./auth/signup'));
router.use('/landing', require('./landing_page/updateLandingPageDetails'));
router.use('/landing', require('./landing_page/updateDepartmentBanner'));
router.use('/landing', require('./landing_page/updateNotifications'));
router.use('/landing', require('./landing_page/updateAnnouncements'));

module.exports = router;
