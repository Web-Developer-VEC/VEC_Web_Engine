const express = require('express');
const { getHostelDetails } = require('../controllers/hostel_controllers');

const router = express.Router();

router.get('/hostel_menu', getHostelDetails);

module.exports = router;