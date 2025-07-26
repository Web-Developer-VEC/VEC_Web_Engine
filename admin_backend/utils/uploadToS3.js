const fs = require('fs');
const path = require('path');
const mime = require('mime-types');
const sharp = require('sharp');
const s3 = require('../config/aws'); 

async function uploadFileToS3FromPath(localFilePath) {
  try {
    const fileExt = path.extname(localFilePath).toLowerCase();
    const isImage = ['.jpg', '.jpeg', '.png'].includes(fileExt);

    if (!fs.existsSync(localFilePath)) {
      throw new Error(`File does not exist: ${localFilePath}`);
    }

    const fileBuffer = fs.readFileSync(localFilePath);
    let finalBuffer = fileBuffer;
    let contentType = mime.lookup(fileExt) || 'application/octet-stream';

    // Final key: Replace 'static/TEMP/' with 'static/' for destination key
    let finalKey = localFilePath
      .replace(/^static[\/\\]TEMP[\/\\]/, 'static/')
      .replace(/\\/g, '/');

    if (isImage) {
      finalBuffer = await sharp(fileBuffer)
        .webp({ quality: 80 })
        .toBuffer();
      contentType = 'image/webp';
      finalKey = finalKey.replace(fileExt, '.webp');
    }

    const params = {
      Bucket: process.env.AWS_S3_NAME,
      Key: finalKey,
      Body: finalBuffer,
      ContentType: contentType,
      ACL: 'public-read',
    };

    const result = await s3.upload(params).promise();

    console.log('Uploaded to S3:', result.Location);
    return {
      s3Path: `/${finalKey}`,
      url: result.Location,
    };
  } catch (error) {
    console.error('S3 Upload Failed:', error.message);
    throw error;
  }
}

module.exports = uploadFileToS3FromPath;