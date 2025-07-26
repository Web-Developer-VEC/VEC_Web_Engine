const express = require('express');
const { getEventDetails } = require('../controllers/event_controllers');
const createRateLimiter = require('../middlewares/ratelimiter');
const limiter = createRateLimiter({ max: 20, windowMs: 5 * 60 * 1000 });

const router = express.Router();

router.get('/events' , limiter, getEventDetails)

module.exports = router;