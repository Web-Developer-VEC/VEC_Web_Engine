const express = require('express');
const general_controller = require ('../../controllers/general_controllers');
const allowedtypes = require('../../models/second_navbar/hostel_models');
const createRateLimiter = require('../../middlewares/ratelimiter');
const xss = require('../../middlewares/xss');
const nosql = require('../../middlewares/sanitizers/nosql_injection');
const hitTracker = require('../../middlewares/hit_tracker')


const limiter = createRateLimiter({ max: 60, windowMs: 10 * 60 * 1000 });

const router = express.Router();

router.post('/hostel_menu', limiter, xss, nosql, hitTracker,  general_controller(allowedtypes,'hostel_details'));

module.exports = router;