const { ObjectId } = require("mongodb");
const { getAdminDb } = require("../../main-backend/config/db");
const { getDb } = require("../../main-backend/config/db");

async function handleTempApproval(req, res, next) {
  try {
    const db = getAdminDb();
    const { status, id, collectionName } = req.body;

    if (!id) {
      return res.status(400).json({ error: "Missing document id" });
    }

    const tempCollection = db.collection(collectionName);

    // Find the document by _id
    const tempDoc = await tempCollection.findOne({ _id: new ObjectId(id) });

    if (!tempDoc) {
      return res.status(404).json({ error: "No request found with this ID" });
    }

    if (status === "approved") {
      await tempCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { status: "approved" } }
      );

      req.tempDoc = { ...tempDoc, status: "approved" };
      const DB = getDb();
      req.mainCollection = DB.collection(collectionName);

      return next();
    }

    if (status === "rejected") {
      await tempCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { status: "rejected" } }
      );
      return res.json({ message: "Request rejected successfully" });
    }

    return res.status(400).json({ error: "Invalid action" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "Server error", details: error.message });
  }
}

module.exports = { handleTempApproval };
