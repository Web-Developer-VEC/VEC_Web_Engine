const { ObjectId } = require("mongodb");
const { getAdminDb, getDb } = require("../../main-backend/config/db");

async function handleTempApproval(req, res, next) {
  try {
    const db = getAdminDb();
    const requests = req.body; 
    
    if (!Array.isArray(requests) || requests.length === 0) {
      return res.status(400).json({ error: "Request body must be a non-empty array" });
    }

    const results = [];
    const approvedDocs = []; // will forward to controller for further handling

    for (const item of requests) {
      const { status, id, collectionName } = item;

      if (!id || !collectionName || !status) {
        results.push({ id, collectionName, error: "Missing required fields" });
        continue;
      }

      const tempCollection = db.collection(collectionName);

      let tempDoc;
      try {
        tempDoc = await tempCollection.findOne({ _id: new ObjectId(id) });
      } catch (err) {
        results.push({ id, collectionName, error: "Invalid document id" });
        continue;
      }

      if (!tempDoc) {
        results.push({ id, collectionName, error: "No request found with this ID" });
        continue;
      }

      if (tempDoc.status !== "pending") {
        results.push({ id, collectionName, error: "Request already processed" });
        continue;
      }

      if (status === "approved") {
        approvedDocs.push({
          tempDoc,
          collectionName,
          tempCollection,
          mainCollection: getDb().collection(collectionName),
        });
        results.push({ id, collectionName, status: "queued-for-approval" });
      } else if (status === "rejected") {
        await tempCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: { status: "rejected" } }
        );
        results.push({ id, collectionName, status: "rejected" });
      } else {
        results.push({ id, collectionName, error: "Invalid action, must be approved or rejected" });
      }
    }

    // If any approvals exist, forward them to the controller
    if (approvedDocs.length > 0) {
      req.approvedDocs = approvedDocs;
      req.bulkResults = results;
      return next();
    }

    // Otherwise just return results here
    return res.json({ results });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error", details: error.message });
  }
}

module.exports = { handleTempApproval };