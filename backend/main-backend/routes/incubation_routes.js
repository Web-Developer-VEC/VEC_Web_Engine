const express = require('express');
const { getIncubationData } = require('../controllers/incubation_controllers');
const createRateLimiter = require('../middlewares/ratelimiter');
const limiter = createRateLimiter({ max: 20, windowMs: 5 * 60 * 1000 });

const router = express.Router();

router.get('/incubation', limiter, getIncubationData);

module.exports = router;