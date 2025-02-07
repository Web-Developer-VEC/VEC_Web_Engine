const express = require('express');
const { getPrincipalData } = require('../controllers/principleController');


const router = express.Router();

router.get('/principal', getPrincipalData);

module.exports = router