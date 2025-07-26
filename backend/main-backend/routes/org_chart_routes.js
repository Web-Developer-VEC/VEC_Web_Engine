const express = require('express');
const { getOrgChart } = require('../controllers/org_chart_controllers');
const createRateLimiter = require('../middlewares/ratelimiter');
const xss = require('../middlewares/xss');

const limiter = createRateLimiter({ max: 20, windowMs: 5 * 60 * 1000 });

const router = express.Router();

router.get('/organization_chart', limiter, xss, getOrgChart);

module.exports = router;