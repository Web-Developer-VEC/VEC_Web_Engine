const express = require('express');
const { getEventDetails } = require('../controllers/eventController');


const router = express.Router();

router.get('/active' , getEventDetails)

module.exports = router;