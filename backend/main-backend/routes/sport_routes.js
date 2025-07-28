const express = require('express');
const { getSportsData } = require('../controllers/sport_controllers');
const createRateLimiter = require('../middlewares/ratelimiter');
const xss = require('../middlewares/xss');
const nosql = require('../middlewares/sanitizers/nosql_injection');


const limiter = createRateLimiter({ max: 20, windowMs: 5 * 60 * 1000 });

const router = express();

router.post('/sportsdata' , limiter, xss,  nosql, getSportsData);
module.exports = router;