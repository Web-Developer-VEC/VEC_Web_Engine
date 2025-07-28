const express = require('express');
const { submitFeedback } = require('../controllers/feedback_controllers');
const nosql = require('../middlewares/sanitizers/nosql_injection');
const createRateLimiter = require('../middlewares/ratelimiter');

const router = express.Router();
const limiter = createRateLimiter({ max: 10, windowMs: 60 * 1000 });

router.post('/submit_feedback', limiter, nosql, submitFeedback);

module.exports = router;
