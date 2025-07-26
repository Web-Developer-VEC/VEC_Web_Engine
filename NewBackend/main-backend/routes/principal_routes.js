const express = require('express');
const { getPrincipalData } = require('../controllers/principle_controllers');


const router = express.Router();

router.get('/principal', getPrincipalData);

module.exports = router