const express = require('express');

const router = express.Router();

const {exportMarks} = require('../../controllers/qa_controllers/qa_markgenerator_controllers');

router.post('/result',exportMarks);

module.exports = router;