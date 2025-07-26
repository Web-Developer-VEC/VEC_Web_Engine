const cron = require('node-cron');
const { getDb } = require('../config/db');

cron.schedule("0 * * * *", async () => {
    console.log("Checking for pending food type updates...");

    try {
        const db = getDb();
        const studentsCollection = db.collection('student_database');
        const cronCollection = db.collection('cronCollection');

        const nowUTC = new Date();
        const nowIST = new Date(nowUTC.getTime() + (5.5 * 60 * 60 * 1000));

        const pendingUpdates = await cronCollection.find({ updation_time: { $lte: nowIST } }).toArray();

        if (pendingUpdates.length === 0) {
            console.log("No pending food type updates at this time.");
            return;
        }

        for (const update of pendingUpdates) {
            const { registration_number, name, foodtype } = update;
            const result = await studentsCollection.updateOne(
                { registration_number },
                { $set: { foodtype } }
            );

            if (result.modifiedCount > 0) {
                console.log(`Successfully updated food type for ${name} (${registration_number}) to ${foodtype}.`);
            } else {
                console.log(`No matching student found for ${name} (${registration_number}).`);
            }
            await cronCollection.deleteOne({ registration_number, name });
        }

        console.log("Food type update process completed.");
    } catch (error) {
        console.error("Error running cron job:", error);
    }
});