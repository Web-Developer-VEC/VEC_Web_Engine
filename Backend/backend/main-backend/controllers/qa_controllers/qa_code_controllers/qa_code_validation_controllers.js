const { getDb } = require("../../../config/db");

async function validateExamCode(req, res) {
  try {
    const db = getDb();
    const scheduleCollection = db.collection("qa_schedule");
    const examCollection = db.collection("qa_exam");
    const sessionCollection = db.collection("qa_exam_sessions");

    const { code } = req.body;
    const user = req.session.user;

    // 1. Validate session
    if (!user || !user.registerno || !user.department || !user.batch) {
      return res.status(401).json({
        success: false,
        message: "Session expired or not logged in"

      });
    }

    const { registerno, department, batch } = user;

    // 2. Validate input
    if (!code) {
      return res.status(400).json({
        success: false,
        message: "Access denied. Invalid request parameters."
      });
    }

    // 3. Find active schedule
    const schedule = await scheduleCollection.findOne({ 
      examCode: code, 
      status: "active" 
    });

    console.log(schedule);
    

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: "Access denied. Invalid exam code."
      });
    }

    // 4. Check time window
    const now = new Date();
    if (now < schedule.validFrom || now > schedule.validTill) {
      return res.status(400).json({
        success: false,
        message: "The exam is not accessible at this time. Please try again during the scheduled time."
      });
    }

    // 5. Get exam details
    const exam = await examCollection.findOne({ scheduleId: schedule._id });

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Exam details are unavailable. Please contact the administrator."
      });
    }

    // 6. Check student eligibility
    const studentFound = exam.students.find(
      student => student.registerno === registerno
    );

    if (!studentFound) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You are not authorized to attend this exam."
      });
    }

    // 7. Check if already completed
    if (studentFound.isComplete) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You already completed this exam."
      });
    }

    // 8. Check existing session status
    const existingSession = await sessionCollection.findOne({
      scheduleId: schedule._id,
      registerno
    });

    if (existingSession) {
      // If session exists, check its status
      if (existingSession.status === "COMPLETED") {
        return res.status(403).json({
          success: false,
          message: "You have already completed this exam."
        });
      }

      if (existingSession.status === "TERMINATED") {
        return res.status(403).json({
          success: false,
          message: `Exam access terminated: ${existingSession.terminatedReason || "Violation detected"}`
        });
      }

      // If ACTIVE or PAUSED, allow resumption
      if (existingSession.status === "ACTIVE" || existingSession.status === "PAUSED") {
        // Get questions with student's previous answers
        const result = await examCollection.aggregate([
          { $match: { scheduleId: schedule._id } },
          { $unwind: "$students" },
          {
            $match: {
              "students.registerno": registerno,
              "students.department": department,
              "students.batch": batch
            }
          },
          {
            $project: {
              _id: 0,
              questions: "$students.questions"
            }
          }
        ]).toArray();

        return res.status(200).json({
          success: true,
          message: "Resuming your exam session.",
          isResume: true,
          examDetails: {
            subject: exam.subject,
            subjectCode: exam.subjectCode,
            questions: result[0]?.questions || [],
            date: schedule.date,
            startTime: schedule.start,
            endTime: schedule.end,
            duration: schedule.duration,
            currentQuestionIndex: existingSession.currentQuestionIndex || 0,
            timeRemaining: Math.max(0, existingSession.endsAt - now) / 1000, // seconds
            scheduleId: schedule._id.toString(),
            examId: exam._id.toString()
          }
        });
      }
    }

    // 9. Get questions for new exam (without answers)
    const result = await examCollection.aggregate([
      { $match: { scheduleId: schedule._id } },
      { $unwind: "$students" },
      {
        $match: {
          "students.registerno": registerno,
          "students.department": department,
          "students.batch": batch
        }
      },
      {
        $project: {
          _id: 0,
          questions: {
            $map: {
              input: "$students.questions",
              as: "q",
              in: {
                question: "$$q.question",
                A: "$$q.A",
                B: "$$q.B",
                C: "$$q.C",
                D: "$$q.D",
                E: "$$q.E"
                // Don't send answer or selectedAnswer
              }
            }
          }
        }
      }
    ]).toArray();

    if (!result.length) {
      return res.status(404).json({
        success: false,
        message: "No questions found for this student"
      });
    }

    // 10. Return exam details (don't create session yet)
    return res.status(200).json({
      success: true,
      message: "Exam code validated successfully. You are eligible to take this exam.",
      isResume: false,
      examDetails: {
        scheduleId: schedule._id.toString(),
        examId: exam._id.toString(),
        subject: exam.subject,
        subjectCode: exam.subjectCode,
        questions: result[0].questions,
        date: schedule.date,
        startTime: schedule.start,
        endTime: schedule.end,
        duration: schedule.duration
      }
    });

  } catch (error) {
    console.error("❌ validateExamCode ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "An unexpected error occurred. Please try again later."
    });
  }
}

module.exports = { validateExamCode };