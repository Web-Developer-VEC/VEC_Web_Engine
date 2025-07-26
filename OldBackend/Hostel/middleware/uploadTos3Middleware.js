const path = require('path');
const sharp = require('sharp'); 
const s3 = require('../config/aws');
const resolveS3Path = require('./s3PathResolver');

async function uploadToS3(file, fieldname) {
  const basePath = 'static/digihostel';
  const folder = resolveS3Path(fieldname);

  const originalExtension = path.extname(file.originalname).toLowerCase();
  const isImage = ['.jpg', '.jpeg', '.png'].includes(originalExtension);

  const newExtension = isImage ? '.webp' : originalExtension;
  const filename = `${Date.now()}-${Math.round(Math.random() * 1E9)}${newExtension}`;
  const key = `${basePath}/${folder}/${filename}`;

  let fileBuffer = file.buffer;
  let contentType = file.mimetype;

  if (isImage) {
    fileBuffer = await sharp(file.buffer)
      .webp({ quality: 80 }) 
      .toBuffer();
    contentType = 'image/webp';
  }

  const params = {
    Bucket: process.env.AWS_S3_NAME,
    Key: key,
    Body: fileBuffer,
    ContentType: contentType,
    ACL: 'public-read',
  };

  const uploadResult = await s3.upload(params).promise();

  console.log('Ajith (key):', key);
  console.log('Ajay (S3 URL):', uploadResult.Location);

  return `/${key}`;
}

module.exports = uploadToS3;