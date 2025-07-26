const express = require('express');
const { getCoeData } = require('../controllers/coe_controllers');

const router = express.Router();

router.get('/coe', getCoeData);

module.exports = router;