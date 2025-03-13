const express = require('express');
const { getAlumni } = require('../controllers/alumniController');

const router = express.Router();

router.get('/alumni', getAlumni);

module.exports = router