const express = require('express');
const { getGrievance} = require('../../controllers/grievance_controllers');
const createRateLimiter = require('../../middlewares/ratelimiter');
const xss = require('../../middlewares/xss');
const sanitize = require('../../middlewares/sanitizers/sanitize_grievance');
const nosql = require('../../middlewares/sanitizers/nosql_injection');
const hitTracker = require('../../middlewares/hit_tracker')
const general_controller = require ('../../controllers/general_controllers');
const allowetypes = require('../../models/second_navbar/help_desk_models');



const limiter = createRateLimiter({ max: 20, windowMs: 10 * 60 * 1000 });

const router = express();

router.post('/get_grievance', limiter, xss, sanitize, nosql, hitTracker,  getGrievance);
router.post('/help_desk', limiter, xss,  nosql, hitTracker,  general_controller(allowetypes,"help_desk"))

module.exports = router;