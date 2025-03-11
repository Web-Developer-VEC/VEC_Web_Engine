const express = require('express');
const { ensureAuthenticatedSuperior } = require('../../middleware/authMiddelware');
const { getStudentDetailsSuperior, incrementBatchYear, updateStudentSuperior } = require('../../controllers/superiorController/superiorStudentController');

const router = express.Router();

router.get('/fetch_student_details_superior', ensureAuthenticatedSuperior, getStudentDetailsSuperior);
router.post('/increment_student_year', ensureAuthenticatedSuperior, incrementBatchYear);
router.post('/update_student_by_warden', ensureAuthenticatedSuperior, updateStudentSuperior);

module.exports = router;