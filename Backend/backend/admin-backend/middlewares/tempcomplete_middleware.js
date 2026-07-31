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

      // 📌 Bucket by (admin + actual day) so requests from different admins,
      // or from the same admin on different days, never get merged together.
      const buckets = {};

      completedRequests.forEach((doc) => {
        const action = doc.action?.toLowerCase();
        if (!action || !["insert", "update", "delete"].includes(action)) return;

        const adminKey = doc.admin?.id || doc.admin?.name || "unknown";
        const dateKey = formatDate(roundToDate(doc.updatedAt));
        const bucketKey = `${adminKey}||${dateKey}`;

        if (!buckets[bucketKey]) {
          buckets[bucketKey] = {
            admin: doc.admin || null,
            dateKey,
            groupedRequests: { insert: [], update: [], delete: [] },
          };
        }

        const filteredData = {
          status: doc.status,
          original_data: doc.original_data,
          meta_data: doc.meta_data,
          category: doc.category,
          collection: doc.collection,
          type: doc.collection_type,
          createdAt: doc.createdAt,
          admin: doc.admin || null, // full admin object (id, name, role) — not just role
          title: doc.title,
          updatedAt: doc.updatedAt,
        };

        buckets[bucketKey].groupedRequests[action].push(filteredData);
      });

      for (const { admin, dateKey, groupedRequests } of Object.values(buckets)) {
        const data = {};
        const actions = [];

        Object.entries(groupedRequests).forEach(([key, value]) => {
          if (value.length > 0) {
            data[key] = value;
            actions.push(key);
          }
        });

        if (actions.length === 0) continue;

        if (!dateGroups[dateKey]) {
          dateGroups[dateKey] = [];
        }

        dateGroups[dateKey].push({
          collection: collectionName,
          action: actions,
          admin, // accurate now: this group only ever contains one admin's docs
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