require('dotenv').config();

module.exports = {
    port: process.env.PORT || 6000,
    mongoUri: process.env.MONGO_URI,
    dbName: process.env.DB_NAME,
    twilio: {
        accountSid: process.env.ACCOUNTSID,
        authToken: process.env.AUTHTOKEN,
        phoneNumber: process.env.TWILIOPHONENUMBER
    },
    sessionSecret: process.env.SESSION_SECRET || "12345678"
};