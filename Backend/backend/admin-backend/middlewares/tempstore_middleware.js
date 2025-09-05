const { getAdminDb } = require("../../main-backend/config/db");

module.exports = async function storeTempMiddleware(req, res, next) {
  try {
    const db = getAdminDb();


    const docs = Array.isArray(req.body) ? req.body : [req.body];

    if (docs.length === 0) {
      return res.status(400).json({ success: false, error: "No documents provided" });
    }

    const adminMeta = {
      id: req.session.admin.id,
      name: req.session.admin.name,
      role: req.session.admin.role,
    };

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
        throw new Error("collectionName, collection_type, action, and title are required");
      }

      return {
        collection: collectionName,
        collection_type,
        action,
        title,
        category: category || null,
        meta_data: meta_data || null,         
        original_data: original_data || null,  
        admin: adminMeta,
        status: "pending",
        createdAt: new Date(),
      };
    });

 
    const collectionName = tempDocs[0].collection;
    const tempCollection = db.collection(collectionName);

    let result;
    if (tempDocs.length === 1) {
      result = await tempCollection.insertOne(tempDocs[0]);
    } else {
      result = await tempCollection.insertMany(tempDocs);
    }

    return res.json({
      success: true,
      message: `Stored ${tempDocs.length} request(s) for admin approval`,
      insertedCount: tempDocs.length,
      insertedIds: result.insertedId || result.insertedIds,
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
