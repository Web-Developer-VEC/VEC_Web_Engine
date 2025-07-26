const express = require('express');
const { getCoeData } = require('../controllers/coeController');

const router = express.Router();

router.get('/coe', getCoeData);

module.exports = router;