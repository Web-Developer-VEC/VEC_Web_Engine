const { getDb } = require("../../config/db");

async function getStudents(req, res) {
  try {
    const { department, year } = req.body;

    if (!department || !year) {
      return res.status(400).json({
        message: "Department and year are required"
      });
    }

    const db = getDb();
    const collection = db.collection("student");

    const students = await collection.find(
      {
        department: department,
        year: Number(year)
      },
      {
        projection: {
          registerno:1
        }
      }
    ).toArray();

    
    if (students.length === 0) {
        return res.status(404).json({
            message: "No students found for given department and year"
        });
    }
    
    const registerNumbers = students.map(s => s.registerno);

    res.status(200).json({
      count: students.length,
      registerNumbers
    });

  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error: error.message
    });
  }
}

module.exports = {
  getStudents
};
