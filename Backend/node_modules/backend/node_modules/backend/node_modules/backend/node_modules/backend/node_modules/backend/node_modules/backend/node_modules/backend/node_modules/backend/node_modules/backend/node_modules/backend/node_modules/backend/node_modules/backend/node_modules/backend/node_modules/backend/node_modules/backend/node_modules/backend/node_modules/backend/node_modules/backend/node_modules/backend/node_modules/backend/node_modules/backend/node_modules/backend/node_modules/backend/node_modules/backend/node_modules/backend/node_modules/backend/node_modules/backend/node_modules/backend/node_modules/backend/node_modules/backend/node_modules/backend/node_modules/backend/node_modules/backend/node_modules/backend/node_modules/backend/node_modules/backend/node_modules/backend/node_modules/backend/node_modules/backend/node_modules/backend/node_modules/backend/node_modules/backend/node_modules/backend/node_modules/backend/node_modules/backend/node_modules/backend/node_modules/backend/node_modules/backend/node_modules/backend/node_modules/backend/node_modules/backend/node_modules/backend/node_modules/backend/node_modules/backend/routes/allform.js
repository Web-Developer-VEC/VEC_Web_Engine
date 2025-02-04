const express = require('express');
const { getAllForms } = require('../controllers/allformsController');

const router = express.Router();

router.get('/allforms', getAllForms);

module.exports = router