const { getDb } = require('../config/db');
const logError = require('../middlewares/logerror');
const ALLOWED_TYPES = require('../models/landing/landing_models');

function formatShortDate(date) {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short"
  }).toUpperCase();
}

async function getLandingpageData(req, res) {
  try {
    const { type } = req.body;

    if (!type || typeof type !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid "type" in request body' });
    }

    const db = getDb();
    const collection = db.collection('landing_page_details');

    const allValidTypes = Object.values(ALLOWED_TYPES).flat();

    // Grouped type (like landing_data)
    if (ALLOWED_TYPES[type]) {
      const sections = ALLOWED_TYPES[type];
      const results = [];

      for (const section of sections) {
        if (section === "events") {
          const document = await collection.findOne(
            { type: "events" },
            { projection: { _id: 0, type: 1, data: 1 } }
          );

          if (!document || !Array.isArray(document.data)) continue;

          const today = new Date();
          today.setHours(0, 0, 0, 0);

          const validEvents = document.data.filter(e => e.status === "True");

          const futureEvents = validEvents
            .filter(e => {
              const end = new Date(e.end_date);
              end.setHours(23, 59, 59, 999);
              return end >= today;
            })
            .sort((a, b) => new Date(a.start_date) - new Date(b.start_date));

          let selectedEvents = [...futureEvents];

          if (selectedEvents.length < 8) {
            const pastEvents = validEvents
              .filter(e => {
                const end = new Date(e.end_date);
                end.setHours(23, 59, 59, 999);
                return end < today;
              })
              .sort((a, b) => new Date(b.start_date) - new Date(a.start_date));

            selectedEvents.push(...pastEvents.slice(0, 8 - selectedEvents.length));
          }

          results.push({
            type: "events",
            data: selectedEvents
          });
        } else {
          const doc = await collection.findOne(
            { type: section },
            { projection: { _id: 0, type: 1, data: 1 } }
          );
          if (doc) results.push(doc);
        }
      }

      return res.status(200).json({ type, data: results });
    }

    // Individual section
    if (allValidTypes.includes(type)) {
      const document = await collection.findOne(
        { type },
        { projection: { _id: 0, type: 1, data: 1 } }
      );

      if (!document) {
        return res.status(404).json({ message: `Section '${type}' not found` });
      }

      // Handle individual "events" logic too
      if (type === 'events' && Array.isArray(document.data)) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const validEvents = document.data.filter(e => e.status === "True");

        const futureEvents = validEvents
          .filter(e => {
            const end = new Date(e.end_date);
            end.setHours(23, 59, 59, 999);
            return end >= today;
          })
          .sort((a, b) => new Date(a.start_date) - new Date(b.start_date));

        let selectedEvents = [...futureEvents];

        if (selectedEvents.length < 7) {
          const pastEvents = validEvents
            .filter(e => {
              const end = new Date(e.end_date);
              end.setHours(23, 59, 59, 999);
              return end < today;
            })
            .sort((a, b) => new Date(b.start_date) - new Date(a.start_date));

          selectedEvents.push(...pastEvents.slice(0, 7 - selectedEvents.length));
        }

        return res.status(200).json({
          type: "events",
          data: selectedEvents
        });
      }

      return res.status(200).json(document);
    }

    return res.status(400).json({ error: `"${type}" is not a valid landing page section` });

  } catch (error) {
    console.error('Error fetching landing page section:', error);
    await logError(req, error, 'Error fetching landing page section', 500);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

module.exports = { getLandingpageData };
