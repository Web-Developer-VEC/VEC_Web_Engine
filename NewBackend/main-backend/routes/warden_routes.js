const express = require('express');
const { getWrdenData } = require('../controllers/warden_controllers');

const router = express.Router();

router.get('/warden', getWrdenData);

module.exports = router;