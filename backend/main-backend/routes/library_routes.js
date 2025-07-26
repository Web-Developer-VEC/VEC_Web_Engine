const express = require('express');
const { getLibraryData } = require('../controllers/library_controllers');
const createRateLimiter = require('../middlewares/ratelimiter');
const limiter = createRateLimiter({ max: 20, windowMs: 5 * 60 * 1000 });

const router = express.Router();

router.get('/library', limiter, getLibraryData);


module.exports = router