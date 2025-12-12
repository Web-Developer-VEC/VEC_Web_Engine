const express = require('express');
const { questionbank_generator  } = require('../../controllers/questionbank_generator_controllers.js');
const {questionbank_form} = require('../../controllers/questionbank_generator_controllers.js');
const  {coeloginsecuritycheck} = require('../../controllers/coe_login_controllers.js')
const createRateLimiter = require('../../middlewares/ratelimiter');
const xss = require('../../middlewares/xss');
const nosql  = require('../../middlewares/sanitizers/nosql_injection');

const hitTracker = require('../../middlewares/hit_tracker')

const limiter = createRateLimiter({ max: 800, windowMs: 10 * 60 * 1000 });

const router = express.Router();

router.post('/questionbank_generator', limiter, xss,nosql, hitTracker,coeloginsecuritycheck, questionbank_generator);
router.get('/questionbank_form',limiter, xss,nosql, hitTracker,coeloginsecuritycheck, questionbank_form )


module.exports = router;