const express = require('express');
const { submitFeedback } = require('../controllers/feedback_controller');
const mongoSanitize = require('../middlewares/nosql');
const commonSanitizer = require('../middlewares/sanitizers/common_sanitizer');
const createRateLimiter = require('../middlewares/ratelimiter');

const router = express.Router();
const limiter = createRateLimiter({ max: 10, windowMs: 60 * 1000 });

router.post('/submit_feedback', limiter, mongoSanitize, commonSanitizer, submitFeedback);

module.exports = router;
