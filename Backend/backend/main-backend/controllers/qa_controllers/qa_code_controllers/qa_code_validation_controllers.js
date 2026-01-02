const { getDb } = require("../../../config/db");
const { ObjectId } = require("mongodb");

/**
 * Validate Exam Code and Check Eligibility
 */
async function validateExamCode(req, res) {
  try {
    const db = getDb();
    const scheduleCollection = db.collection("qa_schedule");
    const examCollection = db.collection("qa_exam");

    // Extract input data from the request body
    const { code, registerNo } = req.body;

    // Validate the input payload
    if (!code || !registerNo) {
      return res.status(400).json({
        success: false,
        message: "Access denied. Invalid request parameters."
      });
    }

    // Retrieve the schedule matching the exam code
    const schedule = await scheduleCollection.findOne({ examCode: code, status: "active" });

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: "Access denied. Invalid exam code."
      });
    }

    // Check if the current time is within the exam's valid window
    const now = new Date();
    if (now < schedule.validFrom || now > schedule.validTill) {
      return res.status(400).json({
        success: false,
        message: "The exam is not accessible at this time. Please try again during the scheduled time."
      });
    }

    // Retrieve the qa_exam document linked to the scheduleId
    const exam = await examCollection.findOne({ scheduleId: schedule._id });

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Exam details are unavailable. Please contact the administrator for assistance."
      });
    }

    // Validate if registerNo exists in qa_exam.students
    const studentFound = exam.students.some(student => student.registerno === registerNo);

    if (!studentFound) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You are not authorized to attend this exam."
      });
    }

    // Respond with success if all validations pass
    return res.status(200).json({
      success: true,
      message: "Exam code validated successfully. You are eligible to take this exam.",
      examDetails: {
        subject: exam.subject,
        subjectCode: exam.subjectCode,
        date: schedule.date,
        startTime: schedule.start,
        endTime: schedule.end
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "An unexpected error occurred. Please try again later."
    });
  }
}

module.exports = {
  validateExamCode
};