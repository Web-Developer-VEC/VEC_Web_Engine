const express = require('express');
const { getAllForms } = require('../controllers/allform_controllers');
const createRateLimiter = require('../middlewares/ratelimiter');
const limiter = createRateLimiter({ max: 20, windowMs: 5 * 60 * 1000 });

const router = express.Router();

router.get('/allforms', limiter, getAllForms);

module.exports = router