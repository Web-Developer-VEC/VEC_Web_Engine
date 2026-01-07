const express = require('express');

const router = express.Router();

const {submitAnswer} = require('../../controllers/qa_controllers/qa_next_answer_controllers');
const {qaresult} = require('../../controllers/qa_controllers/qa_submit_result_controllers');
const { validateExamCode } = require("../../controllers/qa_controllers/qa_code_controllers/qa_code_validation_controllers");
const {uploadStudentExcel} = require('../../controllers/qa_controllers/uploadStudentExcel');
const { allowRoles } = require('../../middlewares/role_access_middleware');


router.post('/next',submitAnswer);
router.post('/studentresult',qaresult);
router.post("/validate-exam-code", validateExamCode);

//student insertion
router.post('/studentsupload',allowRoles("admin") ,uploadStudentExcel);




module.exports = router;