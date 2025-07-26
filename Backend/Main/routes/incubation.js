const express = require('express');
const { getIncubationData } = require('../controllers/incubationController');

const router = express();

router.get('/incubation', getIncubationData);

module.exports = router;