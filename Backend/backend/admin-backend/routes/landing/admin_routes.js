const express = require('express');

const {signup, login} = require('../../controllers/admin_controllers');
// const createRateLimiter = require('../../middlewares/ratelimiter');
// const xss = require('../../middlewares/xss');
// const nosql = require('../../middlewares/sanitizers/nosql_injection');
// const hitTracker = require('../../middlewares/hit_tracker')


// const limiter = createRateLimiter({ max: 2500, windowMs: 10 * 60 * 1000 });

const router = express.Router();

router.post('/signup',signup);
router.post('/login', login);


module.exports = router;