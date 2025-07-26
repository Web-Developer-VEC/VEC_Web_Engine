const express = require('express');
const { getEventDetails } = require('../controllers/event_controllers');


const router = express.Router();

router.get('/events' , getEventDetails)

module.exports = router;