const express = require('express');
const { getGalleryData } = require('../controllers/gallery_controllers');
const createRateLimiter = require('../middlewares/ratelimiter');
const limiter = createRateLimiter({ max: 20, windowMs: 5 * 60 * 1000 });

const router = express.Router();

router.get('/gallery', limiter, getGalleryData);

module.exports = router;