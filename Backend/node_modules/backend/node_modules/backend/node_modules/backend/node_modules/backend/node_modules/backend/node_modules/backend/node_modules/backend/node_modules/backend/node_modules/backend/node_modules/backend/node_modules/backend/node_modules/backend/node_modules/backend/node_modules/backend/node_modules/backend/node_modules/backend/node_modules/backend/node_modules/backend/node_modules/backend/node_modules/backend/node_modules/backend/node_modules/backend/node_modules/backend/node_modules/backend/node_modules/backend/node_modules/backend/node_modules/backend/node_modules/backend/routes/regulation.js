const express = require('express');
const { getRegulation, getCurriculumandSyllabus } = require('../controllers/regulationController');


const router = express.Router();

router.get('/regulation', getRegulation);
router.get('/curriculumandsyllabus', getCurriculumandSyllabus)

module.exports = router;