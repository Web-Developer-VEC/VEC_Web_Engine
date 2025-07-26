const AWS = require('aws-sdk');
require('dotenv').config({ quiet: true });

AWS.config.update({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const s3 = new AWS.S3();

s3.listBuckets((err, data) => {
  if (err) {
    console.error('AWS S3 connection failed:', err.message);
  } else {
    console.log('Connected to AWS S3');
  }
});

module.exports = s3;
