const path = require('path');
const s3 = require('../config/aws');
const resolveS3Path = require('./s3PathResolver');

async function uploadToS3(file, fieldname) {
  const basePath = '/static/digihostel';
  const folder = resolveS3Path(fieldname);
  const extension = path.extname(file.originalname);
  const filename = `${Date.now()}-${Math.round(Math.random() * 1E9)}${extension}`;

  const key = `${basePath}/${folder}/${filename}`;

  const params = {
    Bucket: process.env.AWS_S3_NAME, 
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
    ACL: 'public-read', 
  };

  const uploadResult = await s3.upload(params).promise();
  // return uploadResult.Location;

  return key;
}

module.exports = uploadToS3;