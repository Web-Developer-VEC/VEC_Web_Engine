const express = require('express');
const { getVisionMission, getHODDetails, getStaffDetails, getSyllabus, getInfrastructure, getDeptActivities, getStuActivities, getSupportStaff, getMou } = require('../controllers/departmentController');

const router = express.Router();

// Define department routes
router.get('/:deptId/vision&mission', getVisionMission);
router.get('/:deptId/headdepartment', getHODDetails);
router.get('/:deptId/faculties', getStaffDetails);
router.get('/:deptId/syllabus', getSyllabus);
router.get('/:deptId/infrastructure', getInfrastructure);
router.get('/:deptId/activities', getDeptActivities);
router.get('/:deptId/studentactivities', getStuActivities);
router.get('/:deptId/supportingstaff', getSupportStaff);
router.get('/:deptId/mous', getMou);
// router.get('/:deptId/research-data', getRD);


module.exports = router;
