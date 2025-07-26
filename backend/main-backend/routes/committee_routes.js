const express = require('express');
const { getCommittee, getHandbook } = require('../controllers/committee_controllers');
const createRateLimiter = require('../middlewares/ratelimiter');
const limiter = createRateLimiter({ max: 20, windowMs: 5 * 60 * 1000 });

const router = express.Router();

router.get('/committee', limiter, getCommittee);
router.get('/handbook', limiter, getHandbook);

module.exports = router;