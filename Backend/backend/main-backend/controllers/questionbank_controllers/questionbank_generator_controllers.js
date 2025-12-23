const { getDb } = require("../../config/db");
const { ensureSubjectExists } = require("./qexcel_controllers");
const { generateQuestionBankFromDB } = require("./qb_controller");

async function questionbank_form(req, res) {
  try {
    const db = getDb();
    const doc = await db.collection("exams").findOne({ type: "questionbank" });

    if (!doc) {
      return res.status(404).json({ message: "Question Bank not found" });
    }

    return res.json({
      success: true,
      data: doc.data
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
}

async function questionbank_generator(req, res) {
  try {
    const { subjectcode, examType, set } = req.body;

    if (!subjectcode || !examType || !set) {
      return res.status(400).json({
        success: false,
        error: "subjectcode, examType, set are required"
      });
    }

    const subjectCode = subjectcode.trim().toLowerCase();
    const db = getDb();

    const meta = await db
      .collection("exams")
      .findOne({ type: "questionbank" });

    if (!meta) {
      return res.status(404).json({
        success: false,
        error: "Question bank metadata missing"
      });
    }

    const subjectRecord = meta.data?.[0]?.subject?.find(
      s => s.code?.toLowerCase() === subjectCode
    );

    if (!subjectRecord?.excel_path) {
      return res.status(404).json({
        success: false,
        error: "Excel path not found for subject"
      });
    }

    // Ensure subject exists in DB (Excel → DB only once)
    const subjectDoc = await ensureSubjectExists(subjectCode, subjectRecord);

    // Generate paper from DB
    const { paper, examTypeTitle } =
      await generateQuestionBankFromDB(subjectDoc, examType);

    return res.json({
      success: true,
      subjectCode,
      subjectName: subjectDoc.subjectName,
      examType: examTypeTitle,
      paper
    });

  } catch (err) {
    console.error("Question Bank Error:", err);
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
}

module.exports = {
  questionbank_form,
  questionbank_generator
};
