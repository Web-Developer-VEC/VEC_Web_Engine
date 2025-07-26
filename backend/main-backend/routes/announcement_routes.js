const express = require('express');
const { getAnnouncement, getSpecialAnnouncement } = require("../controllers/announcement_controllers");
const createRateLimiter = require('../middlewares/ratelimiter');
const limiter = createRateLimiter({ max: 20, windowMs: 5 * 60 * 1000 });

const router = express.Router();

router.get('/announcements', limiter, getAnnouncement);
router.get('/specialannouncements', limiter, getSpecialAnnouncement);

module.exports = router;