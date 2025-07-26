const express = require('express');
const { getStaffProfile } = require('../controllers/staff_profile_controllers');
const createRateLimiter = require('../middlewares/ratelimiter');
const limiter = createRateLimiter({ max: 20, windowMs: 5 * 60 * 1000 });

const router = express.Router();

router.get('/staffprofile/:unique_id', limiter, getStaffProfile);

module.exports = router