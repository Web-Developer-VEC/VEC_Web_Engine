const express = require('express');
const { submitFeedback } = require('../../controllers/feedback_controllers');
const nosql = require('../../middlewares/sanitizers/nosql_injection');
const createRateLimiter = require('../../middlewares/ratelimiter');
const hitTracker = require('../../middlewares/hit_tracker')

const router = express.Router();
const limiter = createRateLimiter({ max: 10, windowMs: 10 *60 * 1000 });

router.post('/submit_feedback', limiter, nosql,hitTracker,  submitFeedback);

module.exports = router;
