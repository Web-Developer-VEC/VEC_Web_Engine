const express = require("express");
const { validateExamCode } = require("../../controllers/qa_controllers/qa_exam_validation_controllers");

const router = express.Router();

// Route to validate the exam code
router.post("/validate-exam-code", validateExamCode);

module.exports = router;