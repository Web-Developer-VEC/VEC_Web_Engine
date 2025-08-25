const express = require('express');
const {  iicApplyForm  } = require('../../controllers/iic_form_controllers');
const createRateLimiter = require('../../middlewares/ratelimiter');
const xss = require('../../middlewares/xss');
const nosql  = require('../../middlewares/sanitizers/nosql_injection');
const sanitize_iic = require('../../middlewares/sanitizers/sanitize_iicapplynow');
const hitTracker = require('../../middlewares/hit_tracker')

const limiter = createRateLimiter({ max: 800, windowMs: 10 * 60 * 1000 });

const router = express.Router();

router.post('/iic_applynow', limiter, xss,sanitize_iic,nosql, hitTracker,  iicApplyForm);


module.exports = router;