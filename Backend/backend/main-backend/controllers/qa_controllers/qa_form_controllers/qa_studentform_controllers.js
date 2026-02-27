const { getDb } = require("../../../config/db");

async function getStudent(req, res) {
  try {
    const db = getDb();
    const collection = db.collection("student");
    
    const departments = await collection.aggregate([
      { $group: { _id: "$department" } },
      { $project: { _id: 0, department: "$_id" } }
    ]).toArray();

    const departmentArray = departments.map(d => d.department);

    const batchResult = await collection.aggregate([
      {
        $addFields: {
          startYear: {
            $toInt: {
              $arrayElemAt: [{ $split: ["$batch", "-"] }, 0]
            }
          }
        }
      },
      {
        $group: {
          _id: null,
          maxYear: { $max: "$startYear" }
        }
      }
    ]).toArray();

    const maxYear = batchResult[0]?.maxYear;
    if (!maxYear) {
      return res.json({ departments: departmentArray, batches: [] });
    }

    const duration = 4;
    const batchArray = [];

    for (let i = 3; i >= 0; i--) {
      const start = maxYear - i;
      const end = start + duration;
      batchArray.push(`${start}-${end}`);
    }

    res.json({
      departments: departmentArray,
      batches: batchArray
    }); 

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { getStudent };
