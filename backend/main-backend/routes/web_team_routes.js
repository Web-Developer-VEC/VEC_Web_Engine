const express = require('express');
const { getWebTeamData } = require('../controllers/web_team_controllers');
const createRateLimiter = require('../middlewares/ratelimiter');
const limiter = createRateLimiter({ max: 20, windowMs: 5 * 60 * 1000 });

const router = express.Router();

router.get('/web_team', limiter, getWebTeamData);
module.exports = router