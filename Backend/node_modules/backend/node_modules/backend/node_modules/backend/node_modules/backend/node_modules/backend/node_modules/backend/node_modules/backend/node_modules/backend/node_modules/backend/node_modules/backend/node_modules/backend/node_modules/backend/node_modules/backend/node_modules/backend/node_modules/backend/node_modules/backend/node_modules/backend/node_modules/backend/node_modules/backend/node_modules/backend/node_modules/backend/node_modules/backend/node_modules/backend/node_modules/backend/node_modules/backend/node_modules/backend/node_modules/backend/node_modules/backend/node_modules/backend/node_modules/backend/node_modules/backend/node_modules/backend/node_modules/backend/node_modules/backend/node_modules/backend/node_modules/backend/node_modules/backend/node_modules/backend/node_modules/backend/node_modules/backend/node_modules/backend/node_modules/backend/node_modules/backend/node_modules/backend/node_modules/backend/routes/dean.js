const express = require('express');
const { getDean } = require('../controllers/deanController');

const router = express.Router();

router.use('/deanandassociates', getDean);

module.exports = router