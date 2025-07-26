const { getDb } = require('../config/db');
const moment = require('moment');

async function hitTracker(req, res, next) {
    const db = getDb();
    const collection = db.collection('hits_logs');

    const endpoint = req.originalUrl.split('?')[0]; 
    const now = moment();

    const month = now.format('MMMM'); 
    const week = `week${Math.ceil(now.date() / 7)}`; 
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
        
    }

    next();
}

module.exports = hitTracker;
