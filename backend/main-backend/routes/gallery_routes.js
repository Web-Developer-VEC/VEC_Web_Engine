const express = require('express');
const { getGalleryData } = require('../controllers/gallery_controllers');
const createRateLimiter = require('../middlewares/ratelimiter');
const xss = require('../middlewares/xss');

const limiter = createRateLimiter({ max: 20, windowMs: 5 * 60 * 1000 });

const router = express.Router();

router.post('/gallery', limiter, xss, getGalleryData);

module.exports = router;