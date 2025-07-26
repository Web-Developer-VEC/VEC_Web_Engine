const express = require('express');
const { getAbtUs } = require('../controllers/about_us_controllers');

const router = express.Router();

router.get('/about_us', getAbtUs);

module.exports = router;