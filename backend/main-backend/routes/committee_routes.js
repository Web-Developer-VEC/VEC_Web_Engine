const express = require('express');
const { getCommittee, getHandbook } = require('../controllers/committee_controllers');
const createRateLimiter = require('../middlewares/ratelimiter');
const xss = require('../middlewares/xss');

const limiter = createRateLimiter({ max: 20, windowMs: 5 * 60 * 1000 });

const router = express.Router();

router.get('/committee', limiter, xss, getCommittee);
router.get('/handbook', limiter, xss, getHandbook);

module.exports = router;