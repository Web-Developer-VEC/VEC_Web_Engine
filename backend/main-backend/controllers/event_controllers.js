const { getDb } = require('../config/db');
const logError = require('../middlewares/logerror');

async function getEventDetails (req, res){
    const db = getDb();
    const collection = db.collection('events');

    try {
        const activeEvents = await collection.aggregate([
            { $unwind: "$events" },
            { $match: { "events.status": "True" } },
            { $replaceRoot: { newRoot: "$events" } }
        ]).toArray();

        if (activeEvents.length === 0) {
            return res.status(404).json({ message: "No active events found" });
        }

        res.status(200).json(activeEvents);

    } catch (error) {
        console.error("Error fetching active events:", error);
        await logError(req, error, 'Error fetching active events Data', 500);
        res.status(500).json({ error: "Error fetching active events" });
    }
}

module.exports = {getEventDetails};