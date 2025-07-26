const express = require('express');
const { ensureAuthenticatedStudent } = require('../../middleware/authMiddelware');
const { submitVacateForm } = require('../../controllers/studentController/vacateController');

const router = express.Router();

router.post('/submit_vacate_form', ensureAuthenticatedStudent, submitVacateForm);

module.exports = router;