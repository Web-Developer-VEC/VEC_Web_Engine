const express = require('express');
const general_controller = require ('../../controllers/general_controllers')
const createRateLimiter = require('../../middlewares/ratelimiter');
const xss = require('../../middlewares/xss');
const nosql = require('../../middlewares/sanitizers/nosql_injection');
const allowedtypes = require('../../models/top_navbar/academic_models');
const hitTracker = require('../../middlewares/hit_tracker')


const limiter = createRateLimiter({ max: 2500, windowMs: 10 * 60 * 1000 });

const router = express.Router();

router.post('/academics', limiter, xss, nosql,hitTracker,  general_controller(allowedtypes,'academics'));

module.exports = router;