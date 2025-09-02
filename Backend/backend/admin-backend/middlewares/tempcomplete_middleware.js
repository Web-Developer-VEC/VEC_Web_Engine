const { getAdminDb } = require("../config/db");

async function getTempCompleted(req, res) {
try {
    const db = getAdminDb();
    const results = [];

    // loop through all allowed collections
    for (const collectionName of req_collection) {
      const tempCollection = db.collection(collectionName);

      // fetch pending docs
      const pendingRequests = await tempCollection
        .find({ status: { $in: ["approved", "rejected"] } })
      .toArray();

      if (pendingRequests.length === 0) continue; // skip empty
      // group by action
      const groupedRequests = { insert: [], update: [], delete: [] };

      pendingRequests.forEach((doc) => {
        const action = doc.action?.toLowerCase();
        if (action && groupedRequests[action]) {
          let filteredData = {};

          // filter fields by action
          if (action === "insert") {
            filteredData = {
              status: doc.status,
              meta_data: doc.meta_data,
              category: doc.category,
            };
          } else if (action === "update") {
            filteredData = {
              status: doc.status,
              original_data: doc.original_data,
              meta_data: doc.meta_data,
              category: doc.category,
            };
          } else if (action === "delete") {
            filteredData = {
              status: doc.status,
              meta_data: doc.meta_data,
              category: doc.category,
            };
          }

          groupedRequests[action].push(filteredData);
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

      // Extract admin (same for all actions in this collection)
      const details =
        (data.insert && data.insert[0]) ||
        (data.update && data.update[0]) ||
        (data.delete && data.delete[0]);

      const admin_details = details?.admin || null;

      if (actions.length > 0) {
        results.push({
          collection: collectionName,
          action: actions,
          admin: admin_details,
          data,
        });
      }
    }

    return res.json(results); 
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ error: "Server error", details: err.message });
  }
}


module.exports = {getTempCompleted};