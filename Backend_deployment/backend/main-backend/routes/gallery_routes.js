const express = require('express');
const { getGalleryData } = require('../controllers/gallery_controllers');
const createRateLimiter = require('../middlewares/ratelimiter');
const xss = require('../middlewares/xss');
const nosql = require('../middlewares/sanitizers/nosql_injection');


const limiter = createRateLimiter({ max: 50, windowMs: 10 * 60 * 1000 });

const router = express.Router();

router.post('/gallery', limiter, xss, nosql, getGalleryData);

module.exports = router;