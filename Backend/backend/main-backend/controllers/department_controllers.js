const { getDb } = require("../config/db");
const logError = require("../middlewares/logerror");

function DeptMiddleware(allowedTypes, ALLOWED_DEPARTMENTS) {
  return async function (req, res, next) {
    let collectionName = null;

    try {
      const { type, department_id } = req.body;

      // Validate type
      if (!type || typeof type !== 'string') {
        return res.status(400).json({ error: 'Missing or invalid "type" in request body' });
      }
      if (!allowedTypes.has(type)) {
        return res.status(400).json({ error: `"${type}" is not a valid admissions section` });
      }

      // Validate department_id
      if (!department_id || typeof department_id !== 'string') {
        return res.status(400).json({ error: 'Missing or invalid "department_id" in request body' });
      }
      if (!ALLOWED_DEPARTMENTS.includes(department_id.trim())) {
        return res.status(400).json({ error: `"${department_id}" is not a valid department` });
      }

      // Set collection name to department_id
      collectionName = department_id.trim();

      // Query the DB
      const db = getDb();
      const collection = db.collection(collectionName);
      const document = await collection.findOne(
        { type },
        { projection: { _id: 0, type: 1, data: 1 } }
      );

      if (!document) {
        return res.status(404).json({ message: `Section '${type}' not found` });
      }

      return res.status(200).json(document);
    } catch (error) {
      console.error(`Error fetching '${collectionName || "unknown"}' section:`, error);
      await logError(req, error, `Error fetching '${collectionName || "unknown"}' section`, 500);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  };
}

async function getsidebar(req, res) {
  const db = getDb();
  const collection = db.collection('sidebar');
  const deptid = req.params.deptId;

  try {
    const sidebar = await collection.findOne({ dept_id: deptid });

    if (!sidebar) {
      return res.status(404).json({ message: `No data found for deptId: ${deptid}` });
    }
    res.status(200).json(sidebar);
  } catch (error) {
    console.error('Error fetching department sidebar data:', error);
    await logError(req, error, 'Error fetching department sidebar data', 500);
    res.status(500).json({ error: 'Error fetching department sidebar data' });
  }
}

module.exports = { DeptMiddleware, getsidebar };
