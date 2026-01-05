const crypto = require("crypto");
const { getDb } = require("../../../config/db");
const { generateExam } = require("../qa_question_controllers/qa_questionassigner_controllers");

/* ---------------------------------------------------
   Time utilities
--------------------------------------------------- */

function toDateTime(dateStr, timeStr) {
  return new Date(`${dateStr} ${timeStr}`);
}

/* ---------------------------------------------------
   Exam code generator (6 chars A–Z 0–9)
--------------------------------------------------- */

const CHARSET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

function generateExamCode() {
  const bytes = crypto.randomBytes(6);
  let code = "";

  for (let i = 0; i < 6; i++) {
    code += CHARSET[bytes[i] % CHARSET.length];
  }

  return code;
}

/* ---------------------------------------------------
   Validity window
--------------------------------------------------- */

function computeValidity(date, start, end) {
  const startTime = toDateTime(date, start);
  const endTime = toDateTime(date, end);

  return {
    validFrom: new Date(startTime.getTime() - 10 * 60 * 1000),
    validTill: endTime
  };
}

/* ---------------------------------------------------
   In-memory scheduler (per-exam timers)
--------------------------------------------------- */

const scheduledJobs = new Map();

/**
 * Schedule one-time exam activation
 */
function scheduleExamActivation(exam) {
  const { validFrom, validTill } = computeValidity(
    exam.date,
    exam.start,
    exam.end
  );

  const delay = validFrom.getTime() - Date.now();

  // Prevent duplicate scheduling
  if (scheduledJobs.has(exam._id.toString())) return;

  // If already within window → activate immediately
  if (delay <= 0) {
    activateExam(exam._id, validFrom, validTill);
    return;
  }

  const timeoutId = setTimeout(async () => {
    await activateExam(exam._id, validFrom, validTill);
    scheduledJobs.delete(exam._id.toString());
  }, delay);

  scheduledJobs.set(exam._id.toString(), timeoutId);

}

/**
 * Activate exam and generate unique code
 */
async function activateExam(examId, validFrom, validTill) {
  const db = getDb();
  const collection = db.collection("qa_schedule");

  const exam = await collection.findOne({
    _id: examId,
    status: "scheduled"
  });

  if (!exam) return;

  let examCode;
  do {
    examCode = generateExamCode();
  } while (await collection.findOne({ examCode }));

  await collection.updateOne(
    { _id: examId },
    {
      $set: {
        examCode,
        validFrom,
        validTill,
        status: "active"
      }
    }
  );

  await generateExam(
    exam.batch,
    exam.department,
    exam.cie,
    exam.subject,
    exam.subjectCode,
    exam.topics,
    exam.date
  );

}

/* ---------------------------------------------------
   Re-schedule on server restart (IMPORTANT)
--------------------------------------------------- */

async function reschedulePendingExams() {
  const db = getDb();
  const collection = db.collection("qa_schedule");

  const pending = await collection.find({
    status: "scheduled"
  }).toArray();

  pending.forEach(scheduleExamActivation);
}

/* ---------------------------------------------------
   Auto-expire exams (optional helper)
--------------------------------------------------- */

async function expireFinishedExams() {
  const db = getDb();
  const collection = db.collection("qa_schedule");

  await collection.updateMany(
    {
      status: "active",
      validTill: { $lt: new Date() }
    },
    {
      $set: { status: "expired" }
    }
  );
}

/* ---------------------------------------------------
   Exports
--------------------------------------------------- */

module.exports = {
  generateExamCode,
  computeValidity,
  scheduleExamActivation,
  reschedulePendingExams,
  expireFinishedExams
};
