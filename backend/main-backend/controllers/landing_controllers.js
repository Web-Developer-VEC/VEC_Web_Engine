const { getDb } = require('../config/db');
const logError = require('../middlewares/logerror');
const ALLOWED_TYPES = require('../models/landing_models');

function parseEventDate(dateStr) {
  const [day, month, year] = dateStr.split('-');
  return new Date(`${year}-${month}-${day}`);
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
        if (section === 'events') {
          const document = await collection.findOne(
            { type: 'events' },
            { projection: { _id: 0, type: 1, data: 1 } }
          );

          if (!document || !Array.isArray(document.data)) continue;

          const now = new Date();
          const validEvents = document.data.filter(e => e.status === "True");

          const futureEvents = validEvents
            .filter(e => parseEventDate(e.date) >= now)
            .sort((a, b) => parseEventDate(a.date) - parseEventDate(b.date));

          let selectedEvents = [...futureEvents];

          if (selectedEvents.length < 7) {
            const pastEvents = validEvents
              .filter(e => parseEventDate(e.date) < now)
              .sort((a, b) => parseEventDate(b.date) - parseEventDate(a.date));
            const needed = 7 - selectedEvents.length;
            selectedEvents = selectedEvents.concat(pastEvents.slice(0, needed));
          }

          results.push({ type: 'events', data: selectedEvents });
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
        const now = new Date();
        const validEvents = document.data.filter(e => e.status === "True");

        const futureEvents = validEvents
          .filter(e => parseEventDate(e.date) >= now)
          .sort((a, b) => parseEventDate(a.date) - parseEventDate(b.date));

        let selectedEvents = [...futureEvents];

        if (selectedEvents.length < 7) {
          const pastEvents = validEvents
            .filter(e => parseEventDate(e.date) < now)
            .sort((a, b) => parseEventDate(b.date) - parseEventDate(a.date));
          const needed = 7 - selectedEvents.length;
          selectedEvents = selectedEvents.concat(pastEvents.slice(0, needed));
        }

        return res.status(200).json({ type: 'events', data: selectedEvents });
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
