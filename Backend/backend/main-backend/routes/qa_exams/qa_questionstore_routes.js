const express = require("express");
const { uploadFile } = require("../../controllers/qa_controllers/qa_question_controllers/qa_questionstore_controllers");

const router = express.Router();
router.post("/excelupload", uploadFile);


module.exports = router;