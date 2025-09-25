const { getAdminDb } = require("../../main-backend/config/db");
const req_collection = require('../models/request_models');

function roundToDate(date) {
  if (!date) return null;
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d; // return Date object, not ISO string
}

function formatDate(d) {
  if (!d) return null;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0'); 
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;  // e.g. 25-09-2025
}

async function getTempCompleted(req, res) {
  try {
    const db = getAdminDb();
    const dateGroups = {};

    // 📌 Extract filter dates from query params
    const { fromDate, toDate } = req.query;
    let dateFilter = {};

    if (fromDate || toDate) {
      dateFilter.updatedAt = {};
      if (fromDate) {
        dateFilter.updatedAt.$gte = new Date(fromDate);
      }
      if (toDate) {
        // end of day
        const end = new Date(toDate);
        end.setHours(23, 59, 59, 999);
        dateFilter.updatedAt.$lte = end;
      }
    }

    for (const collectionName of req_collection) {
      const tempCollection = db.collection(collectionName);

      // 📌 Apply both status + date filters
      const completedRequests = await tempCollection
        .find({
          status: { $in: ["approved", "rejected"] },
          ...dateFilter,
        })
        .toArray();

      if (completedRequests.length === 0) continue;

      const groupedRequests = { insert: [], update: [], delete: [] };

      completedRequests.forEach((doc) => {
        const action = doc.action?.toLowerCase();
        if (!action || !groupedRequests[action]) return;

        const filteredData = {
          status: doc.status,
          original_data: doc.original_data,
          meta_data: doc.meta_data,
          category: doc.category,
          collection: doc.collection,
          type: doc.collection_type,
          createdAt: doc.createdAt,
          admin: doc.admin?.role || null,
          title: doc.title,
          updatedAt: doc.updatedAt,
        };

        groupedRequests[action].push(filteredData);
      });

      const data = {};
      const actions = [];

      Object.entries(groupedRequests).forEach(([key, value]) => {
        if (value.length > 0) {
          data[key] = value;
          actions.push(key);
        }
      });

      if (actions.length > 0) {
        // pick date from first doc in this collection
        const anyDoc =
          (data.insert && data.insert[0]) ||
          (data.update && data.update[0]) ||
          (data.delete && data.delete[0]);

        const dateKey = formatDate(roundToDate(anyDoc.updatedAt));

        if (!dateGroups[dateKey]) {
          dateGroups[dateKey] = [];
        }

        dateGroups[dateKey].push({
          collection: collectionName,
          action: actions,
          admin: anyDoc?.admin || null,
          data,
        });
      }
    }

    // convert to array format
    const results = Object.entries(dateGroups).map(([date, collections]) => ({
      date,
      collections,
    }));

    return res.json(results);
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ error: "Server error", details: err.message });
  }
}

module.exports = { getTempCompleted };
