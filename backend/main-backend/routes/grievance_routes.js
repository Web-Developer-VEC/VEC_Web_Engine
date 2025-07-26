const express = require('express');
const { getGrievance } = require('../controllers/grievance_controllers');
const createRateLimiter = require('../middlewares/ratelimiter');
const limiter = createRateLimiter({ max: 20, windowMs: 5 * 60 * 1000 });

const router = express();

router.post('/get_grievance', limiter, getGrievance);

module.exports = router;