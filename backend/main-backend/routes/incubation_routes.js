const express = require('express');
const { getIncubationData } = require('../controllers/incubation_controllers');
const createRateLimiter = require('../middlewares/ratelimiter');
const xss = require('../middlewares/xss');

const limiter = createRateLimiter({ max: 20, windowMs: 5 * 60 * 1000 });

const router = express.Router();

router.get('/incubation', limiter, xss, getIncubationData);

module.exports = router;