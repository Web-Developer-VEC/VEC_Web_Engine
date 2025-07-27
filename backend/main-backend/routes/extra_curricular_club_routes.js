const express = require('express');
const { getNssData, getYrcData, getArmyData, getNavyData } = require('../controllers/extra_curricular_club_controllers');
const createRateLimiter = require('../middlewares/ratelimiter');
const xss = require('../middlewares/xss');

const limiter = createRateLimiter({ max: 20, windowMs: 5 * 60 * 1000 });

const router = express();

router.post('/ncc_army', limiter, xss, getArmyData);
router.post('/ncc_navy', limiter, xss, getNavyData);
router.post('/nss', limiter, xss, getNssData);
router.post('/yrc', limiter, xss, getYrcData);

module.exports = router;


