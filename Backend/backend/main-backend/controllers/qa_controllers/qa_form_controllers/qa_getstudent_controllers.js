const { getDb } = require("../../../config/db");

async function getStudentsByDeptYear(department, year) {
  if (!department || !year) {
    throw new Error("Department and year are required");
  }

  const db = getDb();
  const collection = db.collection("student");

  const students = await collection
    .find(
      {
        department,
        year: Number(year)
      },
      {
        projection: { registerno: 1, _id: 0 }
      }
    )
    .toArray();

  return students.map(s => s.registerno);
}

module.exports = { getStudentsByDeptYear };
