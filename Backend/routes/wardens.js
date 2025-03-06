const express = require('express');
const { getWrdenData } = require('../controllers/wardenControllers');

const router = express.Router();

router.get('/warden', getWrdenData);

module.exports = router;