const { getAdminDb } = require("../config/db");
const { getDb } = require("../../main-backend/config/db");

async function handleTempApproval(req, res, next) {
  try {
    const db = getAdminDb();
    const collectionName = req.params.collectionName;
    const { status } = req.body; 

    const tempCollection = db.collection(collectionName);

    // Find by _id, not just first pending
    const tempDoc = await tempCollection.findOne(
      {status: "pending"} ,
      { sort: { createdAt: 1 } } 
    );

    if (!tempDoc) {
      return res.status(404).json({ error: "No pending request found for this ID" });
    }

    if (status === "approved") {
      await tempCollection.updateOne(
        { _id: tempDoc._id },
        { $set: { status: "approved" } }
      );

      req.tempDoc = { ...tempDoc, status: "approved" }; // attach updated doc
      const DB = getDb();
      req.mainCollection = DB.collection(collectionName);

      return next();
    }

    if (status === "reject") {
      await tempCollection.updateOne(
        { _id: tempDoc._id },
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

module.exports = {  handleTempApproval};
