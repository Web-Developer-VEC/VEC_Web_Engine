const express = require('express');
const { getLibrarySection } = require('../controllers/library_controllers');
const createRateLimiter = require('../middlewares/ratelimiter');
const xss = require('../middlewares/xss');
const nosql = require('../middlewares/sanitizers/nosql_injection');


const limiter = createRateLimiter({ max: 200, windowMs: 10 * 60 * 1000 });

const router = express.Router();
router.post('/library', limiter, xss, nosql, getLibrarySection);

router.post('/library', limiter, xss, getLibrarySection);


module.exports = router