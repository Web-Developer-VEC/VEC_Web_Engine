const express = require('express');
const { getAdmin } = require('../controllers/admin_controllers');
const createRateLimiter = require('../middlewares/ratelimiter');
const limiter = createRateLimiter({ max: 20, windowMs: 5 * 60 * 1000 });

const router = express.Router();

router.get('/adminoffice', limiter, getAdmin);

module.exports = router;