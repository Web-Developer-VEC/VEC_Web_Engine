const express = require('express');
const { getAbtUs } = require('../controllers/abtusController');

const router = express.Router();

router.get('/about_us', getAbtUs);

module.exports = router;