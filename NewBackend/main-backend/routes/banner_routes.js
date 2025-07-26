const express = require('express');
const { getBanner } = require('../controllers/banner_controllers');

const router = express.Router();

router.get('/banner', getBanner);

module.exports = router;