const { getAdminDb } = require("../../main-backend/config/db");

module.exports = async function storeTempMiddleware(req, res, next) {
  try {
    const db = getAdminDb();
    const docs = req.docsFromBusboy || [];

    if (!docs || docs.length === 0) {
      return res
        .status(400)
        .json({ success: false, error: "No documents provided" });
    }

    const adminMeta = {
      id: req.session.admin.id,
      name: req.session.admin.name,
      role: req.session.admin.role,
    };

    // Prepare documents for DB with per-document file mapping
    const tempDocs = docs.map((doc, index) => {
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

      // Filter uploaded files that belong to this document (using docIndex)
      const docFiles = (req.uploadedFiles || []).filter(f => f.docIndex === index);

      const pdf_path = docFiles
        .filter(f => f.mimetype === "application/pdf")
        .map(f => f.location || `/${f.key}`);

      const image_path = docFiles
        .filter(f => f.mimetype?.startsWith("image/"))
        .map(f => f.location || `/${f.key}`);

      return {
        collection: collectionName,
        collection_type,
        action,
        title,
        category: category || null,
        meta_data: {
          ...(meta_data || {}),
          ...(image_path.length ? { image_path } : {}),
          ...(pdf_path.length ? { pdf_path } : {}),
        },
        original_data: original_data || null,
        admin: adminMeta,
        status: "pending",
        createdAt: new Date(),
      };
    });

    // Group by collection and insert
    const groupedByCollection = tempDocs.reduce((acc, doc) => {
      if (!acc[doc.collection]) acc[doc.collection] = [];
      acc[doc.collection].push(doc);
      return acc;
    }, {});

    let totalInserted = 0;
    const insertedResults = {};

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
    console.error("❌ TempStore Error:", err);
    return res
      .status(500)
      .json({ success: false, error: "Server error", details: err.message });
  }
};
