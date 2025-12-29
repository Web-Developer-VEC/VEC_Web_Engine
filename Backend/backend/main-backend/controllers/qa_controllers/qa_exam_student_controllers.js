const { getDb } = require("../../config/db");
const { ObjectId } = require("mongodb");

/**
 * Create qa_exam doc and attach students for a schedule
 */
async function createExamFromSchedule(scheduleId) {
  const db = getDb();

  const scheduleCollection = db.collection("qa_schedule");
  const studentCollection = db.collection("student");
  const examCollection = db.collection("qa_exam");

  /* -----------------------------m
     Get schedule
  ----------------------------- */

  const schedule = await scheduleCollection.findOne({
    _id: new ObjectId(scheduleId)
  });

  if (!schedule) {
    throw new Error("Schedule not found");
  }

  /* -----------------------------
     Fetch students based on schedule
  ----------------------------- */

  let students = [];

  // Case 1: Department + Year based
  if (schedule.department && schedule.year) {
    students = await studentCollection.find({
      department: schedule.department,
      year: schedule.year
    }).toArray();
  }

  // Case 2: Register-number based
  if (schedule.registerNo && schedule.registerNo.length > 0) {
    students = await studentCollection.find({
      registerno: { $in: schedule.registerNo }
    }).toArray();
  }

  if (students.length === 0) {
    throw new Error("No students found for this schedule");
  }

  /* -----------------------------
     Prepare student snapshot
  ----------------------------- */

  const studentList = students.map(s => ({
    studentId: s._id,
    registerno: s.registerno,
    name: s.name,
    department: s.department,
    year: s.year,
  }));

  /* -----------------------------
     Create qa_exam document
  ----------------------------- */

  const examDoc = {
    scheduleId: schedule._id,

    subject: schedule.subject,
    subjectCode: schedule.subjectCode,
    cie: schedule.cie,

    students: studentList,

    createdAt: new Date()
  };

  await examCollection.insertOne(examDoc);


  return {
    examId: examDoc._id,
    totalStudents: studentList.length
  };
}

module.exports = {
  createExamFromSchedule
};
