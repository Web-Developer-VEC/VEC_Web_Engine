const { getDb } = require('../config/db');
const logError = require('../middlewares/logerror');
const { ALLOWED_TYPES, ALLOWED_DEPARTMENTS } = require('../models/department_models');

async function getDepartmentSection(req, res) {
  try {

    const { type, department_id } = req.body;

    if (!type || typeof type !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid "type" in request body' });
    }

    if (!ALLOWED_TYPES.includes(type)) {
      return res.status(400).json({ error: `"${type}" is not a valid department section` });
    }

    if (!department_id || typeof department_id !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid "department_id" in request body' });
    }

    if (!ALLOWED_DEPARTMENTS.includes(department_id.trim())) {
      return res.status(400).json({ error: `"${department_id}" is not a valid department` });
    }

    const db = getDb();
    const collection = db.collection(department_id);

    const document = await collection.findOne(
      { type },
      { projection: { _id: 0, type: 1, data: 1 } }
    );

    if (!document) {
      return res.status(404).json({ message: `Section '${type}' not found in department '${department_id}'` });
    }

    return res.status(200).json(document);

  } catch (error) {
    console.error('Error fetching department section:', error);
    await logError(req, error, 'Error fetching department section', 500);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

async function getsidebar (req, res) {
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
        console.error('Error fetching sidebar data:', error);
        await logError(req, error, 'Error fetching sidebar data', 500);
        res.status(500).json({ error: 'Error fetching sidebar data' });
    }
}

module.exports = { getDepartmentSection, getsidebar };
