const express = require('express');
const { getRegulation, getCurriculumandSyllabus } = require('../controllers/regulation_controllers');


const router = express.Router();

router.get('/regulation', getRegulation);
router.get('/curriculumandsyllabus', getCurriculumandSyllabus)

module.exports = router;