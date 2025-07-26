const express = require('express');
const { getAllForms } = require('../controllers/allform_controllers');

const router = express.Router();

router.get('/allforms', getAllForms);

module.exports = router