const QRCode = require('qrcode');
const sharp = require('sharp'); 
const s3 = require('../config/aws');

async function generateQR(pass_id, registration_number) {
  try {
    const jpegBuffer = await QRCode.toBuffer(pass_id, {
      type: 'jpeg',
      width: 300,
      errorCorrectionLevel: 'H',
    });

    const webpBuffer = await sharp(jpegBuffer)
      .webp({ quality: 80 }) 
      .toBuffer();

    const filename = `${registration_number}.webp`;
    const s3Path = `static/digihostel/qrcodes/${filename}`;

    const params = {
      Bucket: process.env.AWS_S3_NAME,
      Key: s3Path,
      Body: webpBuffer,
      ContentType: 'image/webp',
      ACL: 'public-read',
      ContentDisposition: 'attachment', 
    };

    const s3Result = await s3.upload(params).promise();
    console.log(`✅ QR code uploaded to S3 at: ${s3Result.Location}`);

    // return s3Result.Location;
    return `/${s3Path}`
  } catch (error) {
    console.error('❌ Error generating/uploading QR code:', error);
    throw error;
  }
}

module.exports = { generateQR };