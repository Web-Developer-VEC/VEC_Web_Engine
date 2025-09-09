const { getAdminDb } = require("../../main-backend/config/db");

module.exports = async function storeTempMiddleware(req, res, next) {
  try {
    const db = getAdminDb();

    let docs = [];

    // Case 1: form-data with "data" key
    if (req.body.data) {
      try {
        const parsed = JSON.parse(req.body.data);
        docs = Array.isArray(parsed) ? parsed : [parsed];
      } catch (e) {
        return res.status(400).json({
          success: false,
          error: "Invalid JSON in 'data'",
          details: e.message,
        });
      }
    } else {
      // Case 2: raw JSON (application/json)
      docs = Array.isArray(req.body) ? req.body : [req.body];
    }

    if (docs.length === 0) {
      return res.status(400).json({
        success: false,
        error: "No documents provided",
      });
    }

    if (docs.length === 0) {
      return res
        .status(400)
        .json({ success: false, error: "No documents provided" });
    }

    const adminMeta = {
      id: req.session.admin.id,
      name: req.session.admin.name,
      role: req.session.admin.role,
    };

    let fileMeta = { image_path: [], pdf_path: [] };
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        if (file.mimetype.startsWith("image/")) {
          fileMeta.image_path.push(file.path.replace("temp", ""));
        } else if (file.mimetype === "application/pdf") {
          fileMeta.pdf_path.push(file.path.replace("temp", ""));
        }
      }
    }

    const tempDocs = docs.map((doc) => {
      const {
        collectionName,
        collection_type,
        action,
        title,
        category,
        meta_data,
        original_data,
      } = doc;

      if (!collectionName || !collection_type || !action || !title) {
        throw new Error(
          "collectionName, collection_type, action, and title are required"
        );
      }

      return {
        collection: collectionName,
        collection_type,
        action,
        title,
        category: category || null,
        meta_data: {
          ...(meta_data || {}),
          ...(fileMeta.image_path.length ? { image_path: fileMeta.image_path } : {}),
          ...(fileMeta.pdf_path.length ? { pdf_path: fileMeta.pdf_path } : {}),
        },
        original_data: original_data || null,
        admin: adminMeta,
        status: "pending",
        createdAt: new Date(),
      };
    });

    const groupedByCollection = tempDocs.reduce((acc, doc) => {
      if (!acc[doc.collection]) acc[doc.collection] = [];
      acc[doc.collection].push(doc);
      return acc;
    }, {});

    let totalInserted = 0;
    let insertedResults = {};

    for (const [collectionName, groupDocs] of Object.entries(
      groupedByCollection
    )) {
      const tempCollection = db.collection(collectionName);
      if (groupDocs.length === 1) {
        const result = await tempCollection.insertOne(groupDocs[0]);
        totalInserted += 1;
        insertedResults[collectionName] = [result.insertedId];
      } else {
        const result = await tempCollection.insertMany(groupDocs);
        totalInserted += groupDocs.length;
        insertedResults[collectionName] = Object.values(result.insertedIds);
      }
    }

    return res.json({
      success: true,
      message: `Stored ${totalInserted} request(s) across ${
        Object.keys(groupedByCollection).length
      } collection(s) for admin approval`,
      insertedCount: totalInserted,
      insertedIds: insertedResults,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      error: "Server error",
      details: err.message,
    });
  }
};
