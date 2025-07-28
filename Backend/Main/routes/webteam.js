const express = require('express');
const { getWebTeamData } = require('../controllers/web_team_controllers');

const router = express.Router();

router.get('/web_team',getWebTeamData);

module.exports = router