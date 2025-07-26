const express = require('express');
const { getIncubationData } = require('../controllers/incubation_controllers');

const router = express();

router.get('/incubation', getIncubationData);

module.exports = router;