const { getAdminDb } = require("../config/db");

module.exports = async function storeTempMiddleware(req, res, next) {
  try {
    const db = getAdminDb();
    
    const {
      collectionName,
      collection_type,
      action,
      meta_data,
      original_data,
      category,
      title,
    } = req.body;
    const tempCollection = db.collection(collectionName);

    if (!collection_type || !action || !title || !collectionName) {
      return res.status(400).json({ error: "type, action and title and collectionname required" });
    }

  
    // ✅ PLACE IT HERE (extract file paths after multer runs)
    const filePaths = req.files ? req.files.map((file) => file.path) : [];

    // ✅ Build temp document
    const tempDoc = {
      collection: collectionName,
      collection_type,
      action,
      title,
      category: category || null,
      meta_data:
        meta_data || filePaths.length > 0
          ? {
              ...(meta_data || {}),
              ...(filePaths.length > 0 ? { filePaths } : {}),
            }
          : null,
      original_data: original_data || null,
      admin: {
        id: req.session.admin.id,
        name: req.session.admin.name,
        role: req.session.admin.role,
      },
      status: "pending",
      createdAt: new Date(),
    };

    const result = await tempCollection.insertOne(tempDoc);

    return res.json({
      message: "Request stored for admin approval",
      tempId: result.insertedId,
      filePaths,
    });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ error: "Server error", details: err.message });
  }
};
