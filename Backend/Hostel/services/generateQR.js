const QRCode = require('qrcode');
const s3 = require('../config/aws');
const path = require('path');

async function generateQR(pass_id, registration_number) {
  try {
    const buffer = await QRCode.toBuffer(pass_id, {
      type: 'jpeg',
      width: 300,
      errorCorrectionLevel: 'H'
    });

    const filename = `${registration_number}.jpeg`;
    const s3Path = `static/digihostel/qrcodes/${filename}`;

    const params = {
      Bucket: process.env.AWS_S3_NAME,
      Key: s3Path,
      Body: buffer,
      ContentType: 'image/jpeg',
      ACL: 'public-read'
    };

    const s3Result = await s3.upload(params).promise();
    console.log(`✅ QR code uploaded to S3 at: ${s3Result.Location}`);

    return s3Result.Location; 
  } catch (error) {
    console.error('❌ Error generating/uploading QR code:', error);
    throw error;
  }
}

module.exports = { generateQR };
