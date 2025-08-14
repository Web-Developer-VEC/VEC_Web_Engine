const express = require('express');
const allowedtypes =require('../../models/second_navbar/accreditation_models') ;
const general_controller = require ('../../controllers/general_controllers')
const createRateLimiter = require('../../middlewares/ratelimiter');
const xss = require('../../middlewares/xss');
const nosql  = require('../../middlewares/sanitizers/nosql_injection');
const hitTracker = require('../../middlewares/hit_tracker')

const limiter = createRateLimiter({ max: 800, windowMs: 10 * 60 * 1000 });

const router = express.Router();

router.post('/accreditation', limiter, xss, nosql, hitTracker, general_controller(allowedtypes,'accreditations_and_ranking') );


module.exports = router;