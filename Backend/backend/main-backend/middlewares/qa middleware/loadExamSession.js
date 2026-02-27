const { getDb } = require("../../config/db");

module.exports = async function loadExamSession(req, res, next) {
  try {
    const db = getDb();
    const sessionCol = db.collection("qa_exam_sessions");

    const { registerno } = req.session.user;

    const session = await sessionCol.findOne({ registerno });

    if (!session) {
      return res.status(404).json({
        status: "NO_SESSION",
        message: "Exam session not found"
      });
    }

    req.examSession = session;
    next();
  } catch (err) {
    // console.error("loadExamSession error:", err);
    res.status(500).json({ message: "Session load failed" });
  }
};