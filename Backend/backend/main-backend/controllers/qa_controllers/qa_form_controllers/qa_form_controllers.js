const { getDb } = require("../../../config/db");
const { getStudentsByDeptYear } = require("./qa_getstudent_controllers");

async function qa_form(req, res) {
  try {
    const { department, year } = req.body;

    if (!department || !year) {
      return res.status(400).json({
        message: "Department and year are required"
      });
    }

    // ✅ fetch students
    const registerNumbers = await getStudentsByDeptYear(department, year);

    if (registerNumbers.length === 0) {
      return res.status(404).json({
        message: "No students found"
      });
    }

    res.status(200).json({
      students: registerNumbers,
      count: registerNumbers.length,
    });

  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error: error.message
    });
  }
}

async function getQaForm(req, res) {
  try {
    const db = getDb();

    const form_collection = db.collection("qa_form");
    const question_collection = db.collection("qa_question");

    // Fetch years, departments, subjects config
    const [formData] = await form_collection.aggregate([
      {
        $project: {
          _id: 0,
          years: "$data.years",
          departments: "$data.departments",
          subjects: "$data.subjects"
        }
      }
    ]).toArray();

    // Fetch subject → topics mapping
    const subjects = await question_collection.aggregate([
      {
        $project: {
          _id: 0,
          subject_name: 1,
          topics: "$exam.topic"
        }
      }
    ]).toArray();

    res.status(200).json({
      years: formData?.years || [],
      departments: formData?.departments || [],
      subjectList: formData?.subjects || [],
      subjects
    });

  } catch (error) {
    console.error("GET /form error:", error);
    res.status(500).json({
      message: "Server Error",
      error: error.message
    });
  }
}

module.exports = { qa_form, getQaForm };
