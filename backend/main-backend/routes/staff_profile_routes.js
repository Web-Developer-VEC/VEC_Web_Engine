const express = require('express');
const { getStaffProfile } = require('../controllers/staff_profile_controllers');

const router = express.Router();

router.get('/staffprofile/:unique_id', getStaffProfile);

module.exports = router