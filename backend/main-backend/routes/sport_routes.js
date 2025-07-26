const express = require('express');
const { getSportsData } = require('../controllers/sport_controllers');
const createRateLimiter = require('../middlewares/ratelimiter');
const limiter = createRateLimiter({ max: 20, windowMs: 5 * 60 * 1000 });

const router = express();

router.get('/sportsdata' , limiter, getSportsData);

module.exports = router;