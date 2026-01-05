const express = require('express');

const router = express.Router();

const {submitAnswer} = require('../../controllers/qa_controllers/qa_next_answer_controllers');
const {qaresult} = require('../../controllers/qa_controllers/qa_submit_result_controllers');
const { validateExamCode } = require("../../controllers/qa_controllers/qa_code_controllers/qa_code_validation_controllers");


router.post('/next',submitAnswer);
router.post('/studentresult',qaresult);
router.post("/validate-exam-code", validateExamCode);




module.exports = router;