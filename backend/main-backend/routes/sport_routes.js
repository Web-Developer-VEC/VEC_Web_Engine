const express = require('express');
const { getSportsData } = require('../controllers/sport_controllers');

const router = express();

router.get('/sportsdata' , getSportsData);

module.exports = router;