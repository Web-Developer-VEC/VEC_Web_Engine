const cron = require('node-cron');
const mongoHealthCheck = require('../mongo_health_check');
const logError = require('../logerror');

const scheduleMongoHealthCheck = () => {
  cron.schedule('0 0 * * *', async () => {
    try {
      await mongoHealthCheck();
      console.log(`[${new Date().toISOString()}] Mongo health check completed`);
    } catch (error) {
        await logError(req, error, 'Error logging mongo status', 500);
      console.error('Mongo health check failed:', error);
    }
  });
};

module.exports = scheduleMongoHealthCheck;
