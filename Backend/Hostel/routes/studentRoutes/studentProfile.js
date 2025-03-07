const express = require('express');
const { ensureAuthenticatedStudent } = require('../../middleware/authMiddelware');
const { getStudentProfile, changeFoodType, profileChangeRequest } = require('../../controllers/studentController/studentProfileController');

const router = express.Router();

router.get('/fetch_student_profile', ensureAuthenticatedStudent, getStudentProfile);
router.post('/change_food_type', ensureAuthenticatedStudent, changeFoodType);
router.post('/request_profile_update', ensureAuthenticatedStudent, profileChangeRequest);

module.exports = router;