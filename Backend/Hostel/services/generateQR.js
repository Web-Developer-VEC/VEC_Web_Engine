const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');
const storagePaths = require('../config/storage');

async function generateQR(pass_id, registration_number) {
    try {
        // const baseDir = 'D:/Velammal-Engineering-College-Backend/static/qrcodes'; 
        const baseDir = storagePaths.qrCodes;
        if (!fs.existsSync(baseDir)) {
            fs.mkdirSync(baseDir, { recursive: true });
        }
        const filePath = path.join(baseDir, `${registration_number}.jpeg`);

        await QRCode.toFile(filePath, pass_id, {
            type: 'jpeg',
            width: 300,
            errorCorrectionLevel: 'H'
        });

        console.log(`✅ QR code saved at: ${filePath}`);

        return filePath;
    } catch (error) {
        console.error('Error generating QR code:', error);
        throw error;
    }
}

module.exports = { generateQR }