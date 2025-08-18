const express = require('express');
const Placement_Middleware = require('../../controllers/placement_controllers');
const allowedtypes = require('../../models/top_navbar/placement_models');
const createRateLimiter = require('../../middlewares/ratelimiter');
const xss = require('../../middlewares/xss');
const nosql = require('../../middlewares/sanitizers/nosql_injection');
const hitTracker = require('../../middlewares/hit_tracker')


const limiter = createRateLimiter({ max: 70, windowMs: 10 * 60 * 1000 });

const router = express.Router();

router.post('/placement', limiter, xss, nosql,hitTracker,  Placement_Middleware(allowedtypes,'placement'));

module.exports = router;
