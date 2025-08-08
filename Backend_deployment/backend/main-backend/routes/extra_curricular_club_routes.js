const express = require('express');
const { getNssData, getYrcData, getArmyData, getNavyData } = require('../controllers/extra_curricular_club_controllers');
const createRateLimiter = require('../middlewares/ratelimiter');
const xss = require('../middlewares/xss');
const nosql = require('../middlewares/sanitizers/nosql_injection');


const limiter = createRateLimiter({ max: 400, windowMs: 10 * 60 * 1000 });

const router = express();

router.post('/ncc_army', limiter, xss, nosql, getArmyData);
router.post('/ncc_navy', limiter, xss, nosql, getNavyData);
router.post('/nss', limiter, xss, nosql, getNssData);
router.post('/yrc', limiter, xss, nosql, getYrcData);

module.exports = router;


