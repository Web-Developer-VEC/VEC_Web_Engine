const express = require('express');
const general_controller = require ('../../controllers/general_controllers');
const allowedtypes = require('../../models/landing/web_team_models');
const createRateLimiter = require('../../middlewares/ratelimiter');
const nosql = require('../../middlewares/sanitizers/nosql_injection');
const hitTracker = require('../../middlewares/hit_tracker')

const xss = require('../../middlewares/xss');

const limiter = createRateLimiter({ max: 60, windowMs: 10 * 60 * 1000 });

const router = express.Router();

router.post('/web_team', limiter, xss, nosql,hitTracker, general_controller(allowedtypes,'web_team'));
module.exports = router