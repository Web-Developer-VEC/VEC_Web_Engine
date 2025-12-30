const { getDb } = require("../../config/db");

/**
 * View today's exam schedules (staff/admin)
 * Date is derived from server time (SAFE)
 */
async function viewExamCode(req, res) {
  try {
    const db = getDb();
    const collection = db.collection("qa_schedule");

    // Server-side date (YYYY-MM-DD)
    const today = new Date().toISOString().slice(0, 10);

    const exams = await collection
      .find({ date: today })
      .sort({ start: 1 })
      .toArray();

    if (exams.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No exams scheduled for today"
      });
    }

    const response = exams.map(exam => ({
      scheduleId: exam._id,
      year: exam.year,
      department: exam.department,
      cie: exam.cie,
      subject: exam.subject,
      subjectCode: exam.subjectCode,
      start: exam.start,
      end: exam.end,
      examCode: exam.examCode,
      status: exam.status
    }));

    return res.status(200).json({
      success: true,
      date: today,
      count: response.length,
      exams: response
    });

  } catch (error) {
    console.error("❌ Error fetching today's exams:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
}

module.exports = {
  viewExamCode
};
