const express = require('express');
const { getAlumni } = require('../controllers/alumni_controllers');

const router = express.Router();

router.get('/alumni', middle , log ,getAlumni , clo);

module.exports = router