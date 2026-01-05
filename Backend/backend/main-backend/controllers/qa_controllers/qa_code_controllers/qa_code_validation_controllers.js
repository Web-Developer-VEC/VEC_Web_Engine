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
    const sessionCollection = db.collection("qa_exam_sessions");

    // Extract input data from the request body
    const { code } = req.body;

    const user = req.session.user;

if (!user) {
  return res.status(401).json({
    success: false,
    message: "Session expired or not logged in"
  });
}

if (!user) {
  return res.status(401).json({
    success: false,
    message: "Session expired or not logged in"
  });
}

const { registerno, department, year } = user;


if (!registerno || !department || !year) {
  return res.status(401).json({
    success: false,
    message: "Session expired or not logged in"
  });
}

// Validate the input payload
if (!code) {
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

    // Exam session
    // Retrieve the qa_exam document linked to the scheduleId
    const exam = await examCollection.findOne({ scheduleId: schedule._id });

    const durationMinutes = schedule.duration;

    // check if session already exists
    let session = await sessionCollection.findOne({
      scheduleId: schedule._id,
      registerno
    });

    if (!session) {
      await sessionCollection.insertOne({
        scheduleId: schedule._id,
        examId: exam._id,
        studentId: user.id,
        registerno,

        status: "ACTIVE",
        currentQuestionIndex: 0,

        durationMinutes,
        startedAt: now,
        endsAt: new Date(now.getTime() + durationMinutes * 60 * 1000),

        lastSeenAt: now,

        violations: {
          fullscreenExit: 0,
          tabSwitch: 0
        },

        offline: {
          count: 0,
          totalOfflineSeconds: 0
        },
      });
    } else {
      // ❌ Block re-entry
      if (session.status !== "ACTIVE") {
        return res.status(403).json({
          success: false,
          message: `Exam already ${session.status.toLowerCase()}`,
          reason: session.terminatedReason
        });
      }
    }


    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Exam details are unavailable. Please contact the administrator for assistance."
      });
    }

    // Validate if registerno exists in qa_exam.students
    const studentFound = exam.students.some(student => student.registerno === registerno);

    if (!studentFound) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You are not authorized to attend this exam."
      });
    }

    const result = await examCollection.aggregate([
      { $match: { scheduleId: schedule._id } },
      { $unwind: "$students" },
      {
        $match: {
          "students.registerno": registerno,
          "students.department": department,
          "students.year": year
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

    // Respond with success if all validations pass
    return res.status(200).json({
      success: true,
      message: "Exam code validated successfully. You are eligible to take this exam.",
      examDetails: {
        subject: exam.subject,
        subjectCode: exam.subjectCode,
        questions:result[0].questions,
        date: schedule.date,
        startTime: schedule.start,
        endTime: schedule.end
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

module.exports = {
  validateExamCode
};