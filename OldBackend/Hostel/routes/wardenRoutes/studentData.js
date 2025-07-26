const express = require('express');
const { ensureAuthenticatedWarden } = require('../../middleware/authMiddelware');
const { getStudentData, markStudentVacate, foodChangeDirect, roomnoChangeDirect } = require('../../controllers/wardenController/studentDataController');

const router = express.Router();

router.get('/get_student_details', ensureAuthenticatedWarden, getStudentData);
router.post('/mark_student_vacate', ensureAuthenticatedWarden, markStudentVacate);
router.post('/warden_change_foodtype', ensureAuthenticatedWarden, foodChangeDirect);
router.post('/edit_student_room_number', ensureAuthenticatedWarden, roomnoChangeDirect);

module.exports = router;