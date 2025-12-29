const express = require("express");
const router = express.Router();


const { assignQuestionsToStudents } =
  require("../../controllers/qa_controllers/qa_question/qa_questionassigner");

// 2️⃣ Assign questions to students (qa_exam ← papers)
router.post("/assign", assignQuestionsToStudents);

module.exports = router;
