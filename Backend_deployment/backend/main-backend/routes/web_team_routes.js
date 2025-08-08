const express = require('express');
const { getWebTeamData } = require('../controllers/web_team_controllers');
const createRateLimiter = require('../middlewares/ratelimiter');
const nosql = require('../middlewares/sanitizers/nosql_injection');

const xss = require('../middlewares/xss');

const limiter = createRateLimiter({ max: 60, windowMs: 10 * 60 * 1000 });

const router = express.Router();

router.post('/web_team', limiter, xss, nosql, getWebTeamData);
module.exports = router