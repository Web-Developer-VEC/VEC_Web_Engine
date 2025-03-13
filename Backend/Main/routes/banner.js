const express = require('express');
const { getBanner } = require('../controllers/bannerController');

const router = express.Router();

router.get('/banner', getBanner);

module.exports = router;