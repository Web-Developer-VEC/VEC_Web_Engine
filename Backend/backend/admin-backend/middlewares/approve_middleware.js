const { ObjectId } = require("mongodb");
const { getAdminDb, getDb } = require("../../main-backend/config/db");

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

    // ✅ Only allow processing if still pending
    if (tempDoc.status !== "pending") {
      return res.status(400).json({ error: "Request already processed" });
    }

    if (status === "approved") {
      // pass along without updating status yet
      req.tempDoc = tempDoc;
      req.collectionName = collectionName;
      req.tempCollection = tempCollection;
      req.mainCollection = getDb().collection(collectionName);
      return next(); // goes to controller
    }

    if (status === "rejected") {
      await tempCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { status: "rejected" } }
      );
      return res.json({ message: "Request rejected successfully" });
    }

    return res.status(400).json({ error: "Invalid action, must be approved or rejected" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "Server error", details: error.message });
  }
}

module.exports = { handleTempApproval };
