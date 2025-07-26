const express = require('express');
const { getDean } = require('../controllers/dean_controllers');

const router = express.Router();

router.use('/deanandassociates', getDean);

module.exports = router