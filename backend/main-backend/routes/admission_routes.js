const express = require('express');
const { getAdmissionsSection } = require('../controllers/admission_controllers');
const createRateLimiter = require('../middlewares/ratelimiter');
const xss = require('../middlewares/xss');
const nosql = require('../middlewares/sanitizers/nosql_injection');


const limiter = createRateLimiter({ max: 20, windowMs: 5 * 60 * 1000 });

const router = express.Router();

router.post('/admission', limiter, xss, nosql, getAdmissionsSection);

module.exports = router;
