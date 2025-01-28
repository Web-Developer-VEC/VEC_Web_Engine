const express = require('express');
const { getEventDetails } = require('../controllers/eventController');


const router = express.Router();

router.get('/events' , getEventDetails)

module.exports = router;