const express = require('express');
const { getStaffProfile } = require('../controllers/staffprofileController');

const router = express.Router();

router.get('/staffprofile/:unique_id', getStaffProfile);

module.exports = router