const { getDb } = require("../../../config/db");
const { ObjectId } = require("mongodb");
const {scheduleExamActivation} = require("../qa_code_controllers/qa_code_generator_controllers");
const { createExamFromSchedule } = require("./qa_exam_student_controllers");


async function storeExamSchedule(req, res) {
  try {
    const db = getDb();
    const collection = db.collection("qa_schedule");

    const {
      year,
      department,
      registerNo,
      cie,
      subject,
      subjectCode,
      topics,
      date,
      start,
      end
    } = req.body;

    /* -----------------------------
       Validation
    ----------------------------- */

    if (!year || !cie || !subject || !subjectCode || !date || !start || !end || !topics) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields"
      });
    }

    if (!department && (!registerNo || registerNo.length === 0)) {
      return res.status(400).json({
        success: false,
        message: "Either department or registerNo must be provided"
      });
    }


    /* -----------------------------
       Build schedule document
    ----------------------------- */

    const scheduleDoc = {
      year,
      department: department || null,
      registerNo: registerNo || null,

      cie,
      subject,
      subjectCode,

      topics,

      date,
      start,
      end,

      examCode: null,
      validFrom: null,
      validTill: null,
      status: "scheduled",

      createdAt: new Date()
    };

    /* -----------------------------
   Conflict check
----------------------------- */

const conflictQuery = {
  date,
  year,
  status: { $ne: "cancelled" },
  $or: [
    department ? { department } : null,
    registerNo && registerNo.length
      ? { registerNo: { $in: registerNo } }
      : null
  ].filter(Boolean)
};

const existingSchedule = await collection.findOne(conflictQuery);

if (existingSchedule) {
  return res.status(409).json({
    success: false,
    message:
      "An exam is already scheduled for this department or register number on the same date. Please delete the previous schedule and try again.",
    existingScheduleId: existingSchedule._id
  });
}


    /* -----------------------------
       Insert schedule
    ----------------------------- */

    const result = await collection.insertOne(scheduleDoc);

    /* -----------------------------
       Schedule one-time activation
    ----------------------------- */

    await createExamFromSchedule(result.insertedId);

    scheduleExamActivation({
      ...scheduleDoc,
      _id: result.insertedId,year, department, cie, subject, subjectCode, topics, date
    });

    /* -----------------------------
       Response
    ----------------------------- */

    return res.status(201).json({
      success: true,
      message: "Exam schedule saved. Code will activate 10 minutes before exam.",
      scheduleId: result.insertedId
    });

  } catch (error) {
    console.error("❌ Error storing exam schedule:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
}

async function cancelExamSchedule(req, res) {
  try {
    const db = getDb();
    const collection = db.collection("qa_schedule");

    const { scheduleId } = req.body;

    if (!scheduleId) {
      return res.status(400).json({
        success: false,
        message: "scheduleId is required"
      });
    }

    const exam = await collection.findOne({
      _id: new ObjectId(scheduleId)
    });

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Exam schedule not found"
      });
    }

    if (exam.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Exam schedule already cancelled"
      });
    }

    await collection.updateOne(
      { _id: new ObjectId(scheduleId) },
      {
        $set: {
          status: "cancelled",
          examCode: null,
          validFrom: null,
          validTill: null,
          cancelledAt: new Date()
        }
      }
    );

    return res.status(200).json({
      success: true,
      message: "Exam schedule cancelled successfully"
    });

  } catch (error) {
    console.error("❌ Cancel exam error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
}


module.exports = {
  storeExamSchedule,
  cancelExamSchedule
};
