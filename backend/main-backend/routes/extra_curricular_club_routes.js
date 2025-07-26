const express = require('express');
const { getNssData, getYrcData, getArmyData, getNavyData } = require('../controllers/extra_curricular_club_controllers');
const createRateLimiter = require('../middlewares/ratelimiter');
const limiter = createRateLimiter({ max: 20, windowMs: 5 * 60 * 1000 });

const router = express();

router.get('/ncc_army', limiter, getArmyData);
router.get('/ncc_navy', limiter, getNavyData);
router.get('/nss', limiter, getNssData);
router.get('/yrc', limiter, getYrcData);



module.exports = router;


