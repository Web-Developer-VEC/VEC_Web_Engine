const express = require('express');
const general_controller = require ('../../controllers/general_controllers');
const allowetypes = require('../../models/second_navbar/gallery_models');
const createRateLimiter = require('../../middlewares/ratelimiter');
const xss = require('../../middlewares/xss');
const nosql = require('../../middlewares/sanitizers/nosql_injection');
const hitTracker = require('../../middlewares/hit_tracker')


const limiter = createRateLimiter({ max: 50, windowMs: 10 * 60 * 1000 });

const router = express.Router();

router.post('/gallery', limiter, xss, nosql, hitTracker, general_controller(allowetypes,'gallery'));

module.exports = router;