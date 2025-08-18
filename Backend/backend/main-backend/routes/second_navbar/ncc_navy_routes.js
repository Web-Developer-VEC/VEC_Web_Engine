const express = require('express');
const general_controller = require('../../controllers/general_controllers');
const createRateLimiter = require('../../middlewares/ratelimiter');
const xss = require('../../middlewares/xss');
const nosql = require('../../middlewares/sanitizers/nosql_injection');
const allowedtypes = require('../../models/second_navbar/ncc_navy_models')
const hitTracker = require('../../middlewares/hit_tracker')


const limiter = createRateLimiter({ max: 400, windowMs: 10 * 60 * 1000 });

const router = express();

router.post('/ncc_navy', limiter, xss, nosql, hitTracker, general_controller(allowedtypes,'ncc_navy'));

module.exports = router;


