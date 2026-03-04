const { getDb } = require("../config/db");
const logError = require("../middlewares/logerror");
const {DEPARTMENT_CODE_MAP} = require("../models/top_navbar/department_models")

/* ======================================================
   DEPARTMENT + STAFF MIDDLEWARE
====================================================== */

function DeptMiddleware(allowedTypes, ALLOWED_DEPARTMENTS) {
  return async function (req, res, next) {
    let collectionName = null;

    try {
      const { type, department_id } = req.body;

      // Validate type
      
      if (!type || typeof type !== 'string') {
        return res.status(400).json({ error: 'Missing or invalid "type" in request body' });
      }

      /* ----------------------------
         Validate department_id
      ---------------------------- */
      if (!department_id || typeof department_id !== "string") {
        return res.status(400).json({
          error: 'Missing or invalid "department_id" in request body',
        });
      }

      const deptId = department_id.trim();

      if (!ALLOWED_DEPARTMENTS.includes(deptId)) {
        return res.status(400).json({
          error: `"${deptId}" is not a valid department`,
        });
      }

      const db = getDb();

      /* ======================================================
         SPECIAL CASE → FACULTY
         Fetch ENTIRE _staff collection
      ====================================================== */

      if (type === "faculty") {
        collectionName = `${deptId}_staff`;

        const staffData = await db
          .collection(collectionName)
          .find({}, { projection: { _id: 0 } })
          .toArray();

        if (!staffData.length) {
          return res.status(404).json({
            message: `No faculty data found in ${collectionName}`,
          });
        }

        return res.status(200).json({
          department_id: deptId,
          type: "faculty",
          data: staffData,
        });
      }

      /* ======================================================
         NORMAL DEPARTMENT SECTION
      ====================================================== */

      if (!allowedTypes.has(type)) {
        return res.status(400).json({
          error: `"${type}" is not a valid department section`,
        });
      }

      collectionName = deptId;

      const document = await db.collection(collectionName).findOne(
        { type },
        { projection: { _id: 0, type: 1, data: 1 } }
      );

      if (!document) {
        return res.status(404).json({
          message: `Section '${type}' not found in ${collectionName}`,
        });
      }

      return res.status(200).json(document);

    } catch (error) {
      console.error(
        `Error fetching '${collectionName || "unknown"}' section:`,
        error
      );

      await logError(
        req,
        error,
        `Error fetching '${collectionName || "unknown"}' section`,
        500
      );

      return res.status(500).json({
        error: "Internal Server Error",
      });
    }
  };
}

/* ======================================================
   SIDEBAR CONTROLLER
====================================================== */

async function getsidebar(req, res) {
  const db = getDb();
  const collection = db.collection("sidebar");
  const deptid = req.params.deptId;

  try {
    const sidebar = await collection.findOne({ dept_id: deptid });

    if (!sidebar) {
      return res.status(404).json({
        message: `No data found for deptId: ${deptid}`,
      });
    }

    return res.status(200).json(sidebar);

  } catch (error) {
    console.error("Error fetching department sidebar data:", error);

    await logError(
      req,
      error,
      "Error fetching department sidebar data",
      500
    );

    return res.status(500).json({
      error: "Error fetching department sidebar data",
    });
  }
}


/* ======================================================
   GET SINGLE FACULTY BY UNIQUE ID
====================================================== */

/* ======================================================
   GET STAFF (HOD / FACULTY / NON-TEACHING) BY UNIQUE ID
====================================================== */

/* ======================================================
   GET STAFF BY UNIQUE ID (ONLY RETURN DATA)
====================================================== */

async function getStaffByUniqueId(req, res) {
  const { deptId, uniqueId } = req.params;
  let collectionName = null;

  try {
    if (!deptId || !uniqueId) {
      return res.status(400).json({ error: "Invalid parameters" });
    }

    // 🔥 Map 001 → AIDS_001 using department model
    const mappedDepartment = DEPARTMENT_CODE_MAP[deptId];

    if (!mappedDepartment) {
      return res.status(400).json({ error: "Invalid department id" });
    }

    const db = getDb();

    // ✅ Use mapped department
    collectionName = `${mappedDepartment}_staff`;

    const documents = await db.collection(collectionName).find({}).toArray();

    if (!documents.length) {
      return res.status(404).json({ message: "Department not found" });
    }

    let foundStaff = null;

    for (const doc of documents) {

      if (doc.HOD) {
        foundStaff = doc.HOD.find(f => f.unique_id === uniqueId);
        if (foundStaff) break;
      }

      if (doc.FACULTY) {
        foundStaff = doc.FACULTY.find(f => f.unique_id === uniqueId);
        if (foundStaff) break;
      }

      if (doc.NON_TEACHING_FACULTY) {
        foundStaff = doc.NON_TEACHING_FACULTY.find(
          f => f.unique_id === uniqueId
        );
        if (foundStaff) break;
      }
    }

    if (!foundStaff) {
      return res.status(404).json({ message: "Staff not found" });
    }

    // ✅ RETURN ONLY STAFF OBJECT
    return res.status(200).json(foundStaff);

  } catch (error) {
    console.error("Error fetching staff:", error);

    await logError(
      req,
      error,
      `Error fetching staff from ${collectionName}`,
      500
    );

    return res.status(500).json({
      error: "Internal Server Error"
    });
  }
}

module.exports = { DeptMiddleware, getsidebar,  getStaffByUniqueId };