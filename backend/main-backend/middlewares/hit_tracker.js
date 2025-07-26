const { getDb } = require('../config/db');
const moment = require('moment');

async function hitTracker(req, res, next) {
    const db = getDb();
    const collection = db.collection('hits_logs');

    const endpoint = req.originalUrl.split('?')[0]; // remove query params
    const now = moment();

    const month = now.format('MMMM'); // e.g., "July"
    const week = `week${Math.ceil(now.date() / 7)}`; // e.g., "week3"
    const currentYear = now.year();

    try {
        const result = await collection.findOneAndUpdate(

            { endpoint: endpoint },
            {
                $inc: {
                    currentDay: 1,
                    overallCount: 1,
                    [`thisYear.monthly.${month}.overall_month_count`]: 1,
                    [`thisYear.monthly.${month}.${week}`]: 1
                }
            },
            

            { upsert: true, returnDocument: 'after' }
            
        );
        console.log(`Hit tracked for: ${endpoint}`);
        
    } catch (error) {
        console.error('Error tracking hits:', error);
        // Optional: log to your error logging service
    }

    next();
}

module.exports = hitTracker;
