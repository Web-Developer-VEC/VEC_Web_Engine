const express = require('express');

const router = express.Router();

const {getStudents} = require('../../controllers/qa_controllers/qa_getstudent_controllers');

router.get('/getstudent',getStudents);

module.exports = router;