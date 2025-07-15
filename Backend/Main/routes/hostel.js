const express = require('express');
const { getHostelDetails } = require('../controllers/hostelController');

const router = express.Router();

router.get('/hostel_menu', getHostelDetails);

module.exports = router;