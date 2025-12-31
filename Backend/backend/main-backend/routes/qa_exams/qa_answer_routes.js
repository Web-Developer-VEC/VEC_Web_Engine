const express = require('express');

const router = express.Router();

const {submitAnswer} = require('../../controllers/qa_controllers/qa_answer_controllers');

router.post('/next',submitAnswer);

module.exports = router;