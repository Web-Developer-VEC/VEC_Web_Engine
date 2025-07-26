const express = require('express');
const { getSportsData } = require('../controllers/sportsController');

const router = express();

router.get('/sportsdata' , getSportsData);

module.exports = router;