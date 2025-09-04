const { getAdminDb } = require("../config/db");
const { getDb } = require("../../main-backend/config/db");

const req_collection = require("../models/request_models");
/**
 * Get all pending temp requests for a collection
 */

async function getTempRequests(req, res) {
  try {
    const db = getAdminDb();
    const results = [];

    // loop through all allowed collections
    for (const collectionName of req_collection) {
      const tempCollection = db.collection(collectionName);

      // fetch pending docs
      const pendingRequests = await tempCollection
        .find({ status: "pending" })
        .toArray();

      if (pendingRequests.length === 0) continue; // skip empty
      // group by action
      const groupedRequests = { insert: [], update: [], delete: [] };

      pendingRequests.forEach((doc) => {
        const action = doc.action?.toLowerCase();
        if (action && groupedRequests[action]) {
          groupedRequests[action].push({
            id: doc._id,
            collection_type: doc.collection_type,
            action: doc.action,
            data: doc,
          });
        }
      });

      // build response per collection
      const data = {};
      const actions = [];

      Object.entries(groupedRequests).forEach(([key, value]) => {
        if (value.length > 0) {
          data[key] = value;
          actions.push(key);
        }
      });

      // console.log(data);
      const details =
        (data.insert && data.insert[0]) ||
        (data.update && data.update[0]) ||
        (data.delete && data.delete[0]);

      // Extract admin (same for all actions in this collection)
      const admin_details = details?.data?.admin || null;

      if (actions.length > 0) {
        results.push({
          collection: collectionName,
          action: actions,
          admin: admin_details,
          data,
        });
      }
    }

    return res.json(results); // return array directly ✅
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ error: "Server error", details: err.message });
  }
}

async function getTempCompleted(req, res) {
  try {
    const db = getAdminDb();
    const collectionName = req.params.collectionName;
    const tempCollection = db.collection(collectionName);

    // fetch all pending temp requests
    const completedRequests = await tempCollection
      .find({ status: { $in: ["approved", "rejected"] } })
      .toArray();

    return res.json({ data: completedRequests });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ error: "Server error", details: err.message });
  }
}

async function handleTempApproval(req, res, next) {
  try {
    const db = getAdminDb();
    const { collectionName, tempId } = req.params;
    const { status } = req.body; // "approve" or "reject"

    const tempCollection = db.collection(collectionName);

    // Find by _id, not just first pending
    const tempDoc = await tempCollection.findOne({ 
      _id: new ObjectId(tempId), 
      status: "pending" 
    });

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

module.exports = { getTempRequests, handleTempApproval, getTempCompleted };
