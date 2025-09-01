const express = require('express');
const admincontroller = require('../controllers/admin_controllers');
const createRateLimiter = require('../middleware/ratelimiter');
const xss = require('../middleware/xss');
const nosql = require('../middleware/sanitizers/nosql_injection');
const hitTracker = require('../middleware/hit_tracker')


const limiter = createRateLimiter({ max: 2500, windowMs: 10 * 60 * 1000 });

const router = express.Router();

router.post('/signup', limiter, xss, nosql,hitTracker, admincontroller.signup);
router.post('/login', limiter, xss, nosql,hitTracker, admincontroller.login);

module.exports = router;